import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/bill-summary
 * 
 * Returns bill summary report data:
 * - bills list with vendor, category, status, amounts
 * - monthly chart data
 * - summary stats (total, paid, due)
 * 
 * Query params:
 *   startDate, endDate: ISO date strings
 *   vendorId: string (vendor filter)
 *   status: string (bill status filter)
 *   search: string
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const vendorId = searchParams.get("vendorId")
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""

    // Build where clause
    const where: any = { branchId }

    if (startDate || endDate) {
      where.billDate = {}
      if (startDate) where.billDate.gte = new Date(`${startDate}T00:00:00.000Z`)
      if (endDate) where.billDate.lte = new Date(`${endDate}T23:59:59.999Z`)
    }

    if (vendorId && vendorId !== "all") {
      where.vendorId = vendorId
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { billId: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        vendor: true,
        category: true,
        items: true,
      },
      orderBy: { billDate: "desc" },
    })

    // Map bills to response format
    const billData = bills.map(bill => {
      const paid = bill.status === "paid" ? bill.total : bill.status === "partial" ? bill.total * 0.5 : 0
      const dueAmount = bill.total - paid
      return {
        id: bill.id,
        billNumber: bill.billId,
        vendor: bill.vendor?.name ?? "Unknown",
        vendorId: bill.vendorId,
        category: bill.category?.name ?? "General",
        date: bill.billDate.toISOString().slice(0, 10),
        dueDate: bill.dueDate.toISOString().slice(0, 10),
        total: bill.total,
        paidAmount: paid,
        dueAmount,
        status: bill.status,
      }
    })

    // Summary stats
    const summaryStats = billData.reduce((acc, bill) => ({
      totalBill: acc.totalBill + bill.total,
      totalPaid: acc.totalPaid + bill.paidAmount,
      totalDue: acc.totalDue + bill.dueAmount,
    }), { totalBill: 0, totalPaid: 0, totalDue: 0 })

    // Monthly chart data (last 6 months)
    const monthlyData: Record<string, number> = {}
    for (const bill of bills) {
      const monthKey = bill.billDate.toLocaleDateString("en-US", { year: "numeric", month: "short" })
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + bill.total
    }
    const monthlyChartData = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6)

    // Vendor list for filter
    const vendors = await prisma.vendor.findMany({
      where: { branchId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: {
        bills: billData,
        summaryStats,
        monthlyChartData,
        vendors,
      },
    })
  } catch (error) {
    console.error("Error fetching bill summary:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch bill summary" },
      { status: 500 }
    )
  }
}
