import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/cash-flow
 * 
 * Returns monthly cash flow data for a given year:
 * - income per month (from invoices + journal entries with income accounts)
 * - expense per month (from expenses + bills + journal entries with expense accounts)
 * - net profit per month
 * 
 * Query params:
 *   year: string (e.g. "2025")
 *   viewType: 'monthly' | 'quarterly'
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
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10)

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`)
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`)

    // Fetch invoices for income (paid invoices)
    const invoices = await prisma.invoice.findMany({
      where: {
        customer: { branchId },
        issueDate: { gte: startDate, lte: endDate },
      },
      include: { items: true },
    })

    // Fetch expenses for expense data
    const expenses = await prisma.expense.findMany({
      where: {
        branchId,
        date: { gte: startDate, lte: endDate },
      },
    })

    // Fetch bills for expense data
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        billDate: { gte: startDate, lte: endDate },
      },
    })

    // Initialize monthly arrays (12 months)
    const monthlyIncome = Array(12).fill(0)
    const monthlyExpense = Array(12).fill(0)

    // Aggregate invoice income by month
    for (const inv of invoices) {
      const month = inv.issueDate.getMonth() // 0-indexed
      const total = inv.items.reduce((sum, it) => sum + it.amount, 0)
      monthlyIncome[month] += total
    }

    // Aggregate expense by month
    for (const exp of expenses) {
      const month = exp.date.getMonth()
      monthlyExpense[month] += exp.total
    }

    // Aggregate bills by month
    for (const bill of bills) {
      const month = bill.billDate.getMonth()
      monthlyExpense[month] += bill.total
    }

    // Build cash flow data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const cashFlowData = months.map((month, index) => ({
      month,
      income: Math.round(monthlyIncome[index]),
      expense: Math.round(monthlyExpense[index]),
      netProfit: Math.round(monthlyIncome[index] - monthlyExpense[index]),
    }))

    // Summary stats
    const totalIncome = monthlyIncome.reduce((sum, v) => sum + v, 0)
    const totalExpense = monthlyExpense.reduce((sum, v) => sum + v, 0)
    const summaryStats = {
      yearTotalIncome: Math.round(totalIncome),
      yearTotalExpense: Math.round(totalExpense),
      yearNetProfit: Math.round(totalIncome - totalExpense),
      avgMonthlyIncome: Math.round(totalIncome / 12),
      avgMonthlyExpense: Math.round(totalExpense / 12),
    }

    return NextResponse.json({
      success: true,
      data: {
        cashFlowData,
        totalIncome: monthlyIncome.map(v => Math.round(v)),
        totalExpense: monthlyExpense.map(v => Math.round(v)),
        netProfit: monthlyIncome.map((v, i) => Math.round(v - monthlyExpense[i])),
        summaryStats,
        year,
      },
    })
  } catch (error) {
    console.error("Error fetching cash flow:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cash flow" },
      { status: 500 }
    )
  }
}
