import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos/reports
 * Get POS report data (daily/monthly aggregates).
 *
 * Query params:
 *   - type: "daily" | "monthly" (default "daily")
 *   - startDate: ISO date string
 *   - endDate: ISO date string
 *   - startMonth: YYYY-MM string
 *   - endMonth: YYYY-MM string
 *   - warehouseId: string
 *   - customerId: string
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const url = new URL(request.url)

    const type = url.searchParams.get("type") ?? "daily"
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const startMonth = url.searchParams.get("startMonth")
    const endMonth = url.searchParams.get("endMonth")
    const warehouseId = url.searchParams.get("warehouseId")
    const customerId = url.searchParams.get("customerId")

    const where: any = {}
    if (branchId) where.branchId = branchId
    if (warehouseId && warehouseId !== "all") where.warehouseId = warehouseId
    if (customerId && customerId !== "all") where.customerId = customerId

    // Date range filter
    if (type === "daily" && (startDate || endDate)) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    } else if (type === "monthly" && (startMonth || endMonth)) {
      where.createdAt = {}
      if (startMonth) where.createdAt.gte = new Date(`${startMonth}-01`)
      if (endMonth) {
        const [year, month] = endMonth.split("-").map(Number)
        const lastDay = new Date(year, month, 0)
        lastDay.setHours(23, 59, 59, 999)
        where.createdAt.lte = lastDay
      }
    }

    const orders = await prisma.posOrder.findMany({
      where,
      select: {
        id: true,
        posId: true,
        total: true,
        subtotal: true,
        discount: true,
        createdAt: true,
        customerId: true,
        warehouseId: true,
        customer: { select: { name: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    type OrderRow = typeof orders[number]

    // Aggregate data
    const totalRevenue = orders.reduce((sum: number, o: OrderRow) => sum + Number(o.total), 0)
    const totalOrders = orders.length
    const totalDiscount = orders.reduce((sum: number, o: OrderRow) => sum + Number(o.discount), 0)

    // Group by day or month
    const grouped: Record<string, number> = {}
    orders.forEach((order: OrderRow) => {
      const date = new Date(order.createdAt)
      const key =
        type === "monthly"
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          : date.toISOString().slice(0, 10)
      grouped[key] = (grouped[key] || 0) + Number(order.total)
    })

    const chartData = Object.entries(grouped).map(([date, amount]) => ({ date, amount }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        },
        chartData,
        orders: orders.map((o: OrderRow) => ({
          id: o.id,
          posId: o.posId,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          createdAt: o.createdAt,
          customerName: o.customer?.name ?? "Walk-in Customer",
          warehouseName: o.warehouse?.name ?? "",
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching POS reports:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch POS reports" }, { status: 500 })
  }
}
