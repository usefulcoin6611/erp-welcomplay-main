import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/cash-flow
 * 
 * Returns monthly cash flow data for a given year in CashFlowData format:
 * - revenue: CashFlowCategory[] (from invoices by category)
 * - invoice: CashFlowCategory[] (from invoices by customer)
 * - payment: CashFlowCategory[] (from expenses by category)
 * - bill: CashFlowCategory[] (from bills by category)
 * 
 * Query params:
 *   year: string (e.g. "2025")
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

    // Fetch invoices with category info
    const invoices = await prisma.invoice.findMany({
      where: {
        customer: { branchId },
        issueDate: { gte: startDate, lte: endDate },
      },
      include: { items: true, customer: true },
    })

    // Fetch categories for mapping
    const categories = await prisma.category.findMany({
      where: { branchId },
      select: { id: true, name: true },
    })
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: {
        branchId,
        date: { gte: startDate, lte: endDate },
      },
    })

    // Fetch bills
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        billDate: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    })

    // --- Build Revenue (invoices by category) ---
    const revenueByCategory = new Map<string, { name: string; data: number[] }>()
    for (const inv of invoices) {
      const catName = categoryMap.get(inv.categoryId ?? '') || 'General'
      const month = inv.issueDate.getMonth()
      const total = inv.items.reduce((sum, it) => sum + it.amount, 0)
      if (!revenueByCategory.has(catName)) {
        revenueByCategory.set(catName, { name: catName, data: Array(12).fill(0) })
      }
      revenueByCategory.get(catName)!.data[month] += total
    }

    // --- Build Invoice (invoices by customer) ---
    const invoiceByCustomer = new Map<string, { name: string; data: number[] }>()
    for (const inv of invoices) {
      const custName = inv.customer?.name || 'Unknown'
      const month = inv.issueDate.getMonth()
      const total = inv.items.reduce((sum, it) => sum + it.amount, 0)
      if (!invoiceByCustomer.has(custName)) {
        invoiceByCustomer.set(custName, { name: custName, data: Array(12).fill(0) })
      }
      invoiceByCustomer.get(custName)!.data[month] += total
    }

    // --- Build Payment (expenses by category) ---
    const paymentByCategory = new Map<string, { name: string; data: number[] }>()
    for (const exp of expenses) {
      const catName = exp.category || 'Uncategorized'
      const month = exp.date.getMonth()
      if (!paymentByCategory.has(catName)) {
        paymentByCategory.set(catName, { name: catName, data: Array(12).fill(0) })
      }
      paymentByCategory.get(catName)!.data[month] += exp.total
    }

    // --- Build Bill (bills by category) ---
    const billByCategory = new Map<string, { name: string; data: number[] }>()
    for (const bill of bills) {
      const catName = bill.category?.name || 'Uncategorized'
      const month = bill.billDate.getMonth()
      if (!billByCategory.has(catName)) {
        billByCategory.set(catName, { name: catName, data: Array(12).fill(0) })
      }
      billByCategory.get(catName)!.data[month] += bill.total
    }

    // Convert maps to CashFlowCategory arrays
    const toCategories = (map: Map<string, { name: string; data: number[] }>) =>
      Array.from(map.entries()).map(([id, val]) => ({
        id,
        category: val.name,
        data: val.data.map(v => Math.round(v)),
      }))

    const cashFlowData = {
      revenue: toCategories(revenueByCategory),
      invoice: toCategories(invoiceByCustomer),
      payment: toCategories(paymentByCategory),
      bill: toCategories(billByCategory),
    }

    // Calculate totals
    const months = Array.from({ length: 12 }, (_, i) => i)
    const totalIncome = months.map(i => {
      const rev = cashFlowData.revenue.reduce((sum, c) => sum + c.data[i], 0)
      const inv = cashFlowData.invoice.reduce((sum, c) => sum + c.data[i], 0)
      return rev + inv
    })
    const totalExpense = months.map(i => {
      const pay = cashFlowData.payment.reduce((sum, c) => sum + c.data[i], 0)
      const bil = cashFlowData.bill.reduce((sum, c) => sum + c.data[i], 0)
      return pay + bil
    })
    const netProfit = months.map((_, i) => totalIncome[i] - totalExpense[i])

    const summaryStats = {
      yearTotalIncome: totalIncome.reduce((s, v) => s + v, 0),
      yearTotalExpense: totalExpense.reduce((s, v) => s + v, 0),
      yearNetProfit: totalIncome.reduce((s, v) => s + v, 0) - totalExpense.reduce((s, v) => s + v, 0),
      avgMonthlyIncome: Math.round(totalIncome.reduce((s, v) => s + v, 0) / 12),
      avgMonthlyExpense: Math.round(totalExpense.reduce((s, v) => s + v, 0) / 12),
    }

    return NextResponse.json({
      success: true,
      data: {
        cashFlowData,
        totalIncome,
        totalExpense,
        netProfit,
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
