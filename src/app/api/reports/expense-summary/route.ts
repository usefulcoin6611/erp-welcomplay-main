import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/expense-summary
 * 
 * Returns expense summary data aggregated from expenses + bills:
 * - monthly/quarterly/half-yearly/yearly breakdown
 * - by category
 * 
 * Query params:
 *   period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
 *   year: string (e.g. "2025")
 *   category: string (category filter)
 *   vendorId: string (vendor filter)
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
    const vendorId = searchParams.get("vendorId") || "All"

    // For yearly period, fetch last 4 years
    const years = period === "yearly"
      ? [year - 3, year - 2, year - 1, year]
      : [year]

    const startDate = new Date(`${years[0]}-01-01T00:00:00.000Z`)
    const endDate = new Date(`${years[years.length - 1]}-12-31T23:59:59.999Z`)

    // Fetch expenses
    const expenseWhere: any = {
      branchId,
      date: { gte: startDate, lte: endDate },
    }
    if (category !== "All") expenseWhere.category = category

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      orderBy: { date: "asc" },
    })

    // Fetch bills
    const billWhere: any = {
      branchId,
      billDate: { gte: startDate, lte: endDate },
    }
    if (vendorId !== "All") billWhere.vendorId = vendorId

    const bills = await prisma.bill.findMany({
      where: billWhere,
      include: { vendor: true, category: true },
      orderBy: { billDate: "asc" },
    })

    // Build expense records
    const expenseRecords = expenses.map(e => ({
      date: e.date.toISOString().slice(0, 10),
      category: e.category || "Uncategorized",
      total: e.total,
      vendorName: e.party || "",
    }))

    // Build bill records
    const billRecords = bills.map(b => ({
      date: b.billDate.toISOString().slice(0, 10),
      category: b.category?.name || "Uncategorized",
      total: b.total,
      vendorName: b.vendor?.name || "",
    }))

    // Filter by category
    const filteredExpenses = category === "All"
      ? expenseRecords
      : expenseRecords.filter(r => r.category === category)

    const filteredBills = category === "All"
      ? billRecords
      : billRecords.filter(r => r.category === category)

    // Build period-based aggregation
    const result = buildPeriodData(filteredExpenses, filteredBills, period, years)

    // Get unique categories and vendors for filter options
    const allCategories = new Set<string>()
    expenseRecords.forEach(r => allCategories.add(r.category))
    billRecords.forEach(r => allCategories.add(r.category))

    const vendors = await prisma.vendor.findMany({
      where: { branchId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        categories: ["All", ...Array.from(allCategories).sort()],
        vendors: [{ id: "All", name: "All" }, ...vendors],
        period,
        year,
      },
    })
  } catch (error) {
    console.error("Error fetching expense summary:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense summary" },
      { status: 500 }
    )
  }
}

function buildPeriodData(
  expenseRecords: { date: string; category: string; total: number }[],
  billRecords: { date: string; category: string; total: number }[],
  period: string,
  years: number[]
) {
  if (period === "yearly") {
    const paymentYearly = aggregateYearly(expenseRecords, years)
    const billYearly = aggregateYearly(billRecords, years)
    return {
      paymentData: paymentYearly,
      billData: billYearly,
      monthLabels: years.map(String),
    }
  }

  const paymentMonthly = aggregateMonthly(expenseRecords)
  const billMonthly = aggregateMonthly(billRecords)

  if (period === "quarterly") {
    return {
      paymentData: toBuckets(paymentMonthly, 4, 3),
      billData: toBuckets(billMonthly, 4, 3),
      monthLabels: ["Q1", "Q2", "Q3", "Q4"],
    }
  }

  if (period === "half-yearly") {
    return {
      paymentData: toBuckets(paymentMonthly, 2, 6),
      billData: toBuckets(billMonthly, 2, 6),
      monthLabels: ["H1", "H2"],
    }
  }

  return {
    paymentData: paymentMonthly,
    billData: billMonthly,
    monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  }
}

function aggregateMonthly(records: { date: string; category: string; total: number }[]) {
  const result: Record<string, number[]> = {}
  for (const r of records) {
    const month = parseInt(r.date.slice(5, 7), 10) - 1
    if (month < 0 || month > 11) continue
    const key = r.category
    if (!result[key]) result[key] = Array(12).fill(0)
    result[key][month] += r.total
  }
  return Object.entries(result).map(([category, data]) => ({ category, data }))
}

function aggregateYearly(records: { date: string; category: string; total: number }[], years: number[]) {
  const result: Record<string, number[]> = {}
  for (const r of records) {
    const y = parseInt(r.date.slice(0, 4), 10)
    const idx = years.indexOf(y)
    if (idx === -1) continue
    const key = r.category
    if (!result[key]) result[key] = Array(years.length).fill(0)
    result[key][idx] += r.total
  }
  return Object.entries(result).map(([category, data]) => ({ category, data }))
}

function toBuckets(
  monthlyData: { category: string; data: number[] }[],
  bucketCount: number,
  monthsPerBucket: number
) {
  return monthlyData.map(item => ({
    category: item.category,
    data: Array.from({ length: bucketCount }, (_, i) =>
      item.data.slice(i * monthsPerBucket, (i + 1) * monthsPerBucket).reduce((s, v) => s + v, 0)
    ),
  }))
}
