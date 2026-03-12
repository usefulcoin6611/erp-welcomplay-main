import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/income-vs-expense
 * 
 * Returns income vs expense comparison data:
 * - income totals per period (from invoices)
 * - expense totals per period (from expenses + bills)
 * - profit/loss per period
 * 
 * Query params:
 *   period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
 *   year: string (e.g. "2025")
 *   category: string
 *   customerId: string
 *   vendorId: string
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null
    if (!branchId) {
      return NextResponse.json({ success: false, message: "User has no assigned branch" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10)
    const category = searchParams.get("category") || "All"
    const customerId = searchParams.get("customerId") || "All"
    const vendorId = searchParams.get("vendorId") || "All"

    // For yearly period, fetch last 4 years
    const years = period === "yearly"
      ? [year - 3, year - 2, year - 1, year]
      : [year]

    const startDate = new Date(`${years[0]}-01-01T00:00:00.000Z`)
    const endDate = new Date(`${years[years.length - 1]}-12-31T23:59:59.999Z`)

    // Fetch invoices (income)
    const invoiceWhere: any = {
      customer: { branchId },
      issueDate: { gte: startDate, lte: endDate },
    }
    if (customerId !== "All") invoiceWhere.customerId = customerId

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      include: { items: true },
    })

    // Fetch expenses
    const expenseWhere: any = {
      branchId,
      date: { gte: startDate, lte: endDate },
    }
    if (category !== "All") expenseWhere.category = category

    const expenses = await prisma.expense.findMany({ where: expenseWhere })

    // Fetch bills
    const billWhere: any = {
      branchId,
      billDate: { gte: startDate, lte: endDate },
    }
    if (vendorId !== "All") billWhere.vendorId = vendorId

    const bills = await prisma.bill.findMany({ where: billWhere })

    // Build period data
    const bucketCount = getBucketCount(period)
    const monthsPerBucket = getMonthsPerBucket(period)

    let invoiceTotal: number[]
    let paymentTotal: number[]
    let billTotal: number[]

    if (period === "yearly") {
      invoiceTotal = Array(years.length).fill(0)
      paymentTotal = Array(years.length).fill(0)
      billTotal = Array(years.length).fill(0)

      for (const inv of invoices) {
        const y = inv.issueDate.getFullYear()
        const idx = years.indexOf(y)
        if (idx !== -1) {
          invoiceTotal[idx] += inv.items.reduce((sum, it) => sum + it.amount, 0)
        }
      }
      for (const exp of expenses) {
        const y = exp.date.getFullYear()
        const idx = years.indexOf(y)
        if (idx !== -1) paymentTotal[idx] += exp.total
      }
      for (const bill of bills) {
        const y = bill.billDate.getFullYear()
        const idx = years.indexOf(y)
        if (idx !== -1) billTotal[idx] += bill.total
      }
    } else {
      // Monthly first, then bucket
      const monthlyInvoice = Array(12).fill(0)
      const monthlyPayment = Array(12).fill(0)
      const monthlyBill = Array(12).fill(0)

      for (const inv of invoices) {
        const m = inv.issueDate.getMonth()
        monthlyInvoice[m] += inv.items.reduce((sum, it) => sum + it.amount, 0)
      }
      for (const exp of expenses) {
        const m = exp.date.getMonth()
        monthlyPayment[m] += exp.total
      }
      for (const bill of bills) {
        const m = bill.billDate.getMonth()
        monthlyBill[m] += bill.total
      }

      if (period === "monthly") {
        invoiceTotal = monthlyInvoice
        paymentTotal = monthlyPayment
        billTotal = monthlyBill
      } else {
        invoiceTotal = toBuckets(monthlyInvoice, bucketCount, monthsPerBucket)
        paymentTotal = toBuckets(monthlyPayment, bucketCount, monthsPerBucket)
        billTotal = toBuckets(monthlyBill, bucketCount, monthsPerBucket)
      }
    }

    // Calculate income, expense, profit
    const incomeTotal = invoiceTotal.map(v => Math.round(v))
    const expenseTotal = invoiceTotal.map((_, i) => Math.round(paymentTotal[i] + billTotal[i]))
    const profitTotal = incomeTotal.map((v, i) => v - expenseTotal[i])

    const monthList = getMonthList(period, years)

    const chartData = monthList.map((month, index) => ({
      month,
      profit: profitTotal[index],
    }))

    return NextResponse.json({
      success: true,
      data: {
        monthList,
        invoiceTotal: incomeTotal,
        revenueTotal: Array(incomeTotal.length).fill(0), // No separate revenue model
        paymentTotal: paymentTotal.map(v => Math.round(v)),
        billTotal: billTotal.map(v => Math.round(v)),
        incomeTotal,
        expenseTotal,
        profitTotal,
        chartData,
        period,
        year,
      },
    })
  } catch (error) {
    console.error("Error fetching income vs expense:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch income vs expense" },
      { status: 500 }
    )
  }
}

function getBucketCount(period: string): number {
  if (period === "quarterly") return 4
  if (period === "half-yearly") return 2
  return 12
}

function getMonthsPerBucket(period: string): number {
  if (period === "quarterly") return 3
  if (period === "half-yearly") return 6
  return 1
}

function toBuckets(monthly: number[], bucketCount: number, monthsPerBucket: number): number[] {
  return Array.from({ length: bucketCount }, (_, i) =>
    monthly.slice(i * monthsPerBucket, (i + 1) * monthsPerBucket).reduce((s, v) => s + v, 0)
  )
}

function getMonthList(period: string, years: number[]): string[] {
  if (period === "yearly") return years.map(String)
  if (period === "quarterly") return ["Q1", "Q2", "Q3", "Q4"]
  if (period === "half-yearly") return ["H1", "H2"]
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}
