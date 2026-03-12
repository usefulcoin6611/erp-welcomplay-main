import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/payables
 * 
 * Returns payables report data from bills:
 * - vendor-balance: outstanding balance per vendor
 * - payable-summary: bill summary per vendor
 * - payable-details: bill line items per vendor
 * - aging-summary: aging buckets per vendor
 * - aging-details: aging per bill
 * 
 * Query params:
 *   startDate, endDate: ISO date strings
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
    const search = searchParams.get("search") || ""

    // Build date filter
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`)
    if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`)

    const today = new Date()

    // Fetch all bills with vendor and items
    const bills = await prisma.bill.findMany({
      where: {
        branchId,
        ...(Object.keys(dateFilter).length > 0 ? { billDate: dateFilter } : {}),
      },
      include: {
        vendor: true,
        items: true,
        category: true,
      },
      orderBy: { billDate: "desc" },
    })

    // --- Vendor Balance ---
    const vendorBalanceMap = new Map<string, {
      vendorId: string
      vendor: string
      openingBalance: number
      billed: number
      paid: number
      closingBalance: number
    }>()

    for (const bill of bills) {
      const vendorName = bill.vendor?.name ?? "Unknown"
      const billTotal = bill.total
      // Estimate paid amount: for paid bills, full amount; for partial, estimate 50%; for others, 0
      const paid = bill.status === "paid" ? billTotal : bill.status === "partial" ? billTotal * 0.5 : 0
      const balance = billTotal - paid

      const existing = vendorBalanceMap.get(bill.vendorId)
      if (existing) {
        existing.billed += billTotal
        existing.paid += paid
        existing.closingBalance += balance
      } else {
        vendorBalanceMap.set(bill.vendorId, {
          vendorId: bill.vendorId,
          vendor: vendorName,
          openingBalance: 0,
          billed: billTotal,
          paid,
          closingBalance: balance,
        })
      }
    }

    const vendorBalance = Array.from(vendorBalanceMap.values())
      .filter(v => !search || v.vendor.toLowerCase().includes(search.toLowerCase()))

    // --- Payable Summary ---
    const payableSummary = bills
      .filter(bill => {
        const vendorName = bill.vendor?.name ?? ""
        return !search || 
          vendorName.toLowerCase().includes(search.toLowerCase()) ||
          bill.billId.toLowerCase().includes(search.toLowerCase())
      })
      .map(bill => {
        const paid = bill.status === "paid" ? bill.total : bill.status === "partial" ? bill.total * 0.5 : 0
        const balance = bill.total - paid
        return {
          vendorId: bill.vendorId,
          vendor: bill.vendor?.name ?? "Unknown",
          transaction: bill.billId,
          date: bill.billDate.toISOString().slice(0, 10),
          dueDate: bill.dueDate.toISOString().slice(0, 10),
          billAmount: bill.total,
          paid,
          balance,
          status: bill.status,
        }
      })

    // --- Payable Details ---
    const payableDetails: any[] = []
    for (const bill of bills) {
      const vendorName = bill.vendor?.name ?? "Unknown"
      for (const item of bill.items) {
        if (search && 
          !vendorName.toLowerCase().includes(search.toLowerCase()) &&
          !bill.billId.toLowerCase().includes(search.toLowerCase()) &&
          !item.itemName.toLowerCase().includes(search.toLowerCase())
        ) continue
        payableDetails.push({
          vendorId: bill.vendorId,
          vendor: vendorName,
          transaction: bill.billId,
          date: bill.billDate.toISOString().slice(0, 10),
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          taxRate: item.taxRate,
          amount: item.amount,
        })
      }
    }

    // --- Aging Summary ---
    const agingMap = new Map<string, {
      vendorId: string
      vendor: string
      current: number
      days1_15: number
      days16_30: number
      days31_45: number
      over45Days: number
      total: number
    }>()

    for (const bill of bills) {
      if (bill.status === "paid") continue
      const vendorName = bill.vendor?.name ?? "Unknown"
      if (search && !vendorName.toLowerCase().includes(search.toLowerCase())) continue

      const paid = bill.status === "partial" ? bill.total * 0.5 : 0
      const balance = bill.total - paid
      if (balance <= 0) continue

      const daysOverdue = Math.floor((today.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const existing = agingMap.get(bill.vendorId) ?? {
        vendorId: bill.vendorId,
        vendor: vendorName,
        current: 0,
        days1_15: 0,
        days16_30: 0,
        days31_45: 0,
        over45Days: 0,
        total: 0,
      }

      if (daysOverdue <= 0) existing.current += balance
      else if (daysOverdue <= 15) existing.days1_15 += balance
      else if (daysOverdue <= 30) existing.days16_30 += balance
      else if (daysOverdue <= 45) existing.days31_45 += balance
      else existing.over45Days += balance

      existing.total += balance
      agingMap.set(bill.vendorId, existing)
    }

    const agingSummary = Array.from(agingMap.values())

    // --- Aging Details ---
    const agingDetails = bills
      .filter(bill => bill.status !== "paid")
      .filter(bill => {
        const vendorName = bill.vendor?.name ?? ""
        return !search || 
          vendorName.toLowerCase().includes(search.toLowerCase()) ||
          bill.billId.toLowerCase().includes(search.toLowerCase())
      })
      .map(bill => {
        const paid = bill.status === "partial" ? bill.total * 0.5 : 0
        const balance = bill.total - paid
        const daysOverdue = Math.floor((today.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          vendorId: bill.vendorId,
          vendor: bill.vendor?.name ?? "Unknown",
          transaction: bill.billId,
          date: bill.billDate.toISOString().slice(0, 10),
          dueDate: bill.dueDate.toISOString().slice(0, 10),
          daysOverdue: Math.max(0, daysOverdue),
          balance,
          status: bill.status,
        }
      })

    // Totals
    const totalBalance = vendorBalance.reduce((sum, v) => sum + v.closingBalance, 0)
    const agingSummaryTotals = agingSummary.reduce((acc, row) => ({
      current: acc.current + row.current,
      days1_15: acc.days1_15 + row.days1_15,
      days16_30: acc.days16_30 + row.days16_30,
      days31_45: acc.days31_45 + row.days31_45,
      over45Days: acc.over45Days + row.over45Days,
      total: acc.total + row.total,
    }), { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, over45Days: 0, total: 0 })

    return NextResponse.json({
      success: true,
      data: {
        vendorBalance,
        payableSummary,
        payableDetails,
        agingSummary,
        agingDetails,
        totalBalance,
        agingSummaryTotals,
      },
    })
  } catch (error) {
    console.error("Error fetching payables report:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch payables report" },
      { status: 500 }
    )
  }
}
