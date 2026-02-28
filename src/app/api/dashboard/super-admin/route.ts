import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

const SUCCESS_STATUSES = ["success", "Approved", "succeeded"]

/**
 * GET /api/dashboard/super-admin
 * Returns dashboard stats for super admin only. Other roles must not use this.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const db = prisma as any

    // Total companies = users with role company
    const [totalCompanies, totalOrders, totalRevenue, ordersForChart, planCount, mostPopularPlanRow] = await Promise.all([
      db.user.count({ where: { role: "company" } }),
      db.order.count(),
      db.order.aggregate({
        where: {
          paymentStatus: { in: SUCCESS_STATUSES },
          isRefund: 0,
        },
        _sum: { price: true },
      }),
      db.order.findMany({
        where: {
          orderDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          paymentStatus: { in: SUCCESS_STATUSES },
          isRefund: 0,
        },
        select: { orderDate: true, price: true },
      }),
      db.plan.count(),
      db.order.groupBy({
        by: ["planName"],
        where: {
          paymentStatus: { in: SUCCESS_STATUSES },
          isRefund: 0,
        },
        _count: { planName: true },
        orderBy: { _count: { planName: "desc" } },
        take: 1,
      }),
    ])

    // Paid companies: have a plan that is not "Free Plan"
    const paidCount = await db.user.count({
      where: {
        role: "company",
        plan: { not: null },
        NOT: { plan: "Free Plan" },
      },
    })

    // Last 7 days income per day (for chart)
    const now = new Date()
    const dayLabels: string[] = []
    const dayData: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)
      dayLabels.push(d.toLocaleDateString("en-US", { weekday: "short" }))
      const sum = ordersForChart
        .filter((o: { orderDate: Date; price: number }) => {
          const dt = new Date(o.orderDate)
          return dt >= d && dt <= dayEnd
        })
        .reduce((acc: number, o: { price: number }) => acc + o.price, 0)
      dayData.push(sum)
    }

    const mostPopularPlan = mostPopularPlanRow?.[0]?.planName ?? "Gold"

    return NextResponse.json({
      success: true,
      data: {
        totalCompanies,
        paidCompanies: paidCount,
        totalOrders,
        totalRevenue: totalRevenue._sum?.price ?? 0,
        totalPlans: planCount,
        mostPopularPlan,
        recentOrdersChart: {
          labels: dayLabels,
          data: dayData,
        },
      },
    })
  } catch (error) {
    console.error("Dashboard super-admin:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
