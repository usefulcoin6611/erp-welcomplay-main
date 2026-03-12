import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos-dashboard
 * Returns stats and chart data for the POS dashboard.
 * - stats: monthlyPOSAmount, totalPOSAmount, monthlyPurchaseAmount, totalPurchaseAmount
 * - chartData: last 10 days with daily POS and Purchase (Bill) totals
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as { branchId?: string | null }).branchId ?? null

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    const last10DaysStart = new Date(now)
    last10DaysStart.setDate(last10DaysStart.getDate() - 9)
    last10DaysStart.setHours(0, 0, 0, 0)

    const posWhereBase: { branchId?: string | null } = {}
    if (branchId) posWhereBase.branchId = branchId

    const billWhereBase: { branchId?: string | null } = {}
    if (branchId) billWhereBase.branchId = branchId

    // --- Stats: POS (current month + all time)
    const [posOrdersMonth, posOrdersAll, billsMonth, billsAll] = await Promise.all([
      prisma.posOrder.aggregate({
        where: {
          ...posWhereBase,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: "completed",
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.posOrder.aggregate({
        where: { ...posWhereBase, status: "completed" },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.bill.aggregate({
        where: {
          ...billWhereBase,
          billDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.bill.aggregate({
        where: billWhereBase,
        _sum: { total: true },
        _count: { id: true },
      }),
    ])

    const monthlyPOSAmount = Number(posOrdersMonth._sum.total ?? 0)
    const totalPOSAmount = Number(posOrdersAll._sum.total ?? 0)
    const monthlyPurchaseAmount = Number(billsMonth._sum.total ?? 0)
    const totalPurchaseAmount = Number(billsAll._sum.total ?? 0)

    // --- Chart: last 10 days, daily POS and Purchase (batch query then map by date)
    const chartStart = new Date(now)
    chartStart.setDate(chartStart.getDate() - 9)
    chartStart.setHours(0, 0, 0, 0)
    const chartEnd = new Date(now)
    chartEnd.setHours(23, 59, 59, 999)

    const [posOrdersRange, billsRange] = await Promise.all([
      prisma.posOrder.findMany({
        where: {
          ...posWhereBase,
          status: "completed",
          createdAt: { gte: chartStart, lte: chartEnd },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.bill.findMany({
        where: {
          ...billWhereBase,
          billDate: { gte: chartStart, lte: chartEnd },
        },
        select: { total: true, billDate: true },
      }),
    ])

    const posByDate: Record<string, number> = {}
    const purchaseByDate: Record<string, number> = {}
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      posByDate[dateStr] = 0
      purchaseByDate[dateStr] = 0
    }
    posOrdersRange.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      if (posByDate[key] !== undefined) posByDate[key] += Number(o.total)
    })
    billsRange.forEach((b) => {
      const key = new Date(b.billDate).toISOString().slice(0, 10)
      if (purchaseByDate[key] !== undefined) purchaseByDate[key] += Number(b.total)
    })

    const chartDays = Object.keys(posByDate)
      .sort()
      .map((dateStr) => ({
        date: dateStr,
        POS: Math.round(posByDate[dateStr] * 100) / 100,
        Purchase: Math.round(purchaseByDate[dateStr] * 100) / 100,
      }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          monthlyPOSAmount,
          totalPOSAmount,
          monthlyPurchaseAmount,
          totalPurchaseAmount,
        },
        chartData: chartDays,
      },
    })
  } catch (error) {
    console.error("POS dashboard API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
