import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/income-summary
 * 
 * Returns income summary data aggregated from invoices:
 * - monthly/quarterly/half-yearly/yearly breakdown
 * - by category
 * 
 * Query params:
 *   period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
 *   year: string (e.g. "2025")
 *   category: string (category filter)
 *   customerId: string (customer filter)
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

    // For yearly period, fetch last 4 years
    const years = period === "yearly" 
      ? [year - 3, year - 2, year - 1, year]
      : [year]

    const startDate = new Date(`${years[0]}-01-01T00:00:00.000Z`)
    const endDate = new Date(`${years[years.length - 1]}-12-31T23:59:59.999Z`)

    // Fetch invoices
    const invoiceWhere: any = {
      customer: { branchId },
      issueDate: { gte: startDate, lte: endDate },
    }
    if (customerId !== "All") invoiceWhere.customerId = customerId

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        items: true,
        customer: true,
      },
    })

    // Fetch categories for filter options
    const categories = await prisma.category.findMany({
      where: { branchId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    // Fetch customers for filter options
    const customers = await prisma.customer.findMany({
      where: { branchId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    // Build income data by category and period
    // For invoices, we use the category from the invoice (categoryId)
    const categoryMap = new Map<string, string>()
    if (categories.length > 0) {
      for (const cat of categories) {
        categoryMap.set(cat.id, cat.name)
      }
    }

    // Aggregate invoice data
    const invoiceRecords = invoices.map(inv => ({
      date: inv.issueDate.toISOString().slice(0, 10),
      category: categoryMap.get(inv.categoryId ?? "") || "General",
      total: inv.items.reduce((sum, it) => sum + it.amount, 0),
      customerId: inv.customerId,
    }))

    // Filter by category
    const filteredInvoices = category === "All" 
      ? invoiceRecords 
      : invoiceRecords.filter(r => r.category === category)

    // Build period-based aggregation
    const result = buildPeriodData(filteredInvoices, period, years)

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        categories: ["All", ...categories.map(c => c.name)],
        customers: [{ id: "All", name: "All" }, ...customers],
        period,
        year,
      },
    })
  } catch (error) {
    console.error("Error fetching income summary:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch income summary" },
      { status: 500 }
    )
  }
}

function buildPeriodData(
  records: { date: string; category: string; total: number }[],
  period: string,
  years: number[]
) {
  if (period === "yearly") {
    // Aggregate by year
    const yearlyData: Record<string, number[]> = {}
    for (const r of records) {
      const y = parseInt(r.date.slice(0, 4), 10)
      const idx = years.indexOf(y)
      if (idx === -1) continue
      const key = r.category
      if (!yearlyData[key]) yearlyData[key] = Array(years.length).fill(0)
      yearlyData[key][idx] += r.total
    }
    return {
      invoiceData: Object.entries(yearlyData).map(([category, data]) => ({ category, data })),
      revenueData: [],
      monthLabels: years.map(String),
    }
  }

  // Monthly aggregation for the selected year
  const monthlyData: Record<string, number[]> = {}
  for (const r of records) {
    const month = parseInt(r.date.slice(5, 7), 10) - 1 // 0-indexed
    if (month < 0 || month > 11) continue
    const key = r.category
    if (!monthlyData[key]) monthlyData[key] = Array(12).fill(0)
    monthlyData[key][month] += r.total
  }

  const monthlyResult = Object.entries(monthlyData).map(([category, data]) => ({ category, data }))

  if (period === "quarterly") {
    const quarterlyResult = monthlyResult.map(item => ({
      category: item.category,
      data: [
        item.data.slice(0, 3).reduce((s, v) => s + v, 0),
        item.data.slice(3, 6).reduce((s, v) => s + v, 0),
        item.data.slice(6, 9).reduce((s, v) => s + v, 0),
        item.data.slice(9, 12).reduce((s, v) => s + v, 0),
      ],
    }))
    return {
      invoiceData: quarterlyResult,
      revenueData: [],
      monthLabels: ["Q1", "Q2", "Q3", "Q4"],
    }
  }

  if (period === "half-yearly") {
    const halfYearlyResult = monthlyResult.map(item => ({
      category: item.category,
      data: [
        item.data.slice(0, 6).reduce((s, v) => s + v, 0),
        item.data.slice(6, 12).reduce((s, v) => s + v, 0),
      ],
    }))
    return {
      invoiceData: halfYearlyResult,
      revenueData: [],
      monthLabels: ["H1", "H2"],
    }
  }

  // Monthly (default)
  return {
    invoiceData: monthlyResult,
    revenueData: [],
    monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  }
}
