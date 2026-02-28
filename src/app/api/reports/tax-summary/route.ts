import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/tax-summary
 * 
 * Returns tax summary data:
 * - income taxes: tax collected from invoice items (taxRate > 0)
 * - expense taxes: tax paid on expense/bill items (taxRate > 0)
 * - monthly breakdown per tax type
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

    // Fetch invoice items with tax
    const invoices = await prisma.invoice.findMany({
      where: {
        customer: { branchId },
        issueDate: { gte: startDate, lte: endDate },
      },
      include: { items: true },
    })

    // Fetch expense items with tax
    const expenses = await prisma.expense.findMany({
      where: {
        branchId,
        date: { gte: startDate, lte: endDate },
      },
      include: { items: true },
    })

    // Fetch bill items with tax
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        billDate: { gte: startDate, lte: endDate },
      },
      include: { items: true },
    })

    // Fetch tax definitions
    const taxes = await prisma.tax.findMany({
      orderBy: { name: "asc" },
    })

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // --- Income Taxes (from invoices) ---
    // Group by tax rate
    const incomeTaxMap = new Map<string, number[]>()

    for (const inv of invoices) {
      const month = inv.issueDate.getMonth()
      for (const item of inv.items) {
        if (item.taxRate <= 0) continue
        const taxKey = `${item.taxRate}%`
        if (!incomeTaxMap.has(taxKey)) incomeTaxMap.set(taxKey, Array(12).fill(0))
        // Tax amount = taxRate% of (price * quantity - discount)
        const base = item.price * item.quantity - item.discount
        const taxAmount = (item.taxRate / 100) * base
        incomeTaxMap.get(taxKey)![month] += taxAmount
      }
    }

    // Also match with tax definitions
    for (const tax of taxes) {
      const taxKey = `${tax.rate}%`
      if (!incomeTaxMap.has(taxKey)) {
        // Add empty entry for defined taxes
        incomeTaxMap.set(tax.name, Array(12).fill(0))
      }
    }

    const incomeTaxes = Array.from(incomeTaxMap.entries()).map(([name, data]) => ({
      name,
      data: data.map(v => Math.round(v * 100) / 100),
    }))

    // --- Expense Taxes (from expenses + bills) ---
    const expenseTaxMap = new Map<string, number[]>()

    for (const exp of expenses) {
      const month = exp.date.getMonth()
      for (const item of exp.items) {
        if (item.taxRate <= 0) continue
        const taxKey = `${item.taxRate}%`
        if (!expenseTaxMap.has(taxKey)) expenseTaxMap.set(taxKey, Array(12).fill(0))
        const base = item.price * item.quantity - item.discount
        const taxAmount = (item.taxRate / 100) * base
        expenseTaxMap.get(taxKey)![month] += taxAmount
      }
    }

    for (const bill of bills) {
      const month = bill.billDate.getMonth()
      for (const item of bill.items) {
        if (item.taxRate <= 0) continue
        const taxKey = `${item.taxRate}%`
        if (!expenseTaxMap.has(taxKey)) expenseTaxMap.set(taxKey, Array(12).fill(0))
        const base = item.price * item.quantity - item.discount
        const taxAmount = (item.taxRate / 100) * base
        expenseTaxMap.get(taxKey)![month] += taxAmount
      }
    }

    const expenseTaxes = Array.from(expenseTaxMap.entries()).map(([name, data]) => ({
      name,
      data: data.map(v => Math.round(v * 100) / 100),
    }))

    // Date range label
    const dateRange = `Jan ${year} - Dec ${year}`

    return NextResponse.json({
      success: true,
      data: {
        monthList: months,
        incomeTaxes,
        expenseTaxes,
        dateRange,
        year,
        taxes: taxes.map(t => ({ id: t.id, name: t.name, rate: t.rate })),
      },
    })
  } catch (error) {
    console.error("Error fetching tax summary:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch tax summary" },
      { status: 500 }
    )
  }
}
