import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/receivables
 * 
 * Returns receivables report data from invoices:
 * - customer-balance: outstanding balance per customer
 * - receivable-summary: invoice summary per customer
 * - receivable-details: invoice line items per customer
 * - aging-summary: aging buckets per customer
 * - aging-details: aging per invoice
 * 
 * Query params:
 *   startDate, endDate: ISO date strings
 *   search: string
 *   tab: 'customer-balance' | 'receivable-summary' | 'receivable-details' | 'aging-summary' | 'aging-details'
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

    // Fetch all invoices with customer and items
    const invoices = await prisma.invoice.findMany({
      where: {
        customer: { branchId },
        ...(Object.keys(dateFilter).length > 0 ? { issueDate: dateFilter } : {}),
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { issueDate: "desc" },
    })

    // --- Customer Balance ---
    const customerBalanceMap = new Map<string, {
      customerId: string
      customerName: string
      openingBalance: number
      invoiced: number
      paid: number
      balance: number
    }>()

    for (const inv of invoices) {
      const customerName = inv.customer?.name ?? "Unknown"
      const invoiceTotal = inv.items.reduce((sum, it) => sum + it.amount, 0)
      const paid = invoiceTotal - inv.dueAmount

      const existing = customerBalanceMap.get(inv.customerId)
      if (existing) {
        existing.invoiced += invoiceTotal
        existing.paid += paid
        existing.balance += inv.dueAmount
      } else {
        customerBalanceMap.set(inv.customerId, {
          customerId: inv.customerId,
          customerName,
          openingBalance: 0,
          invoiced: invoiceTotal,
          paid,
          balance: inv.dueAmount,
        })
      }
    }

    const customerBalance = Array.from(customerBalanceMap.values())
      .filter(c => !search || c.customerName.toLowerCase().includes(search.toLowerCase()))

    // --- Receivable Summary ---
    const receivableSummary = invoices
      .filter(inv => {
        const customerName = inv.customer?.name ?? ""
        const invId = inv.invoiceId
        return !search || 
          customerName.toLowerCase().includes(search.toLowerCase()) ||
          invId.toLowerCase().includes(search.toLowerCase())
      })
      .map(inv => {
        const invoiceTotal = inv.items.reduce((sum, it) => sum + it.amount, 0)
        const paid = invoiceTotal - inv.dueAmount
        return {
          customerId: inv.customerId,
          customerName: inv.customer?.name ?? "Unknown",
          transaction: inv.invoiceId,
          date: inv.issueDate.toISOString().slice(0, 10),
          dueDate: inv.dueDate.toISOString().slice(0, 10),
          invoiceAmount: invoiceTotal,
          paid,
          balance: inv.dueAmount,
          status: getInvoiceStatus(inv.status, inv.dueDate, today),
        }
      })

    // --- Receivable Details ---
    const receivableDetails: any[] = []
    for (const inv of invoices) {
      const customerName = inv.customer?.name ?? "Unknown"
      for (const item of inv.items) {
        if (search && 
          !customerName.toLowerCase().includes(search.toLowerCase()) &&
          !inv.invoiceId.toLowerCase().includes(search.toLowerCase()) &&
          !item.itemName.toLowerCase().includes(search.toLowerCase())
        ) continue
        receivableDetails.push({
          customerId: inv.customerId,
          customerName,
          transaction: inv.invoiceId,
          date: inv.issueDate.toISOString().slice(0, 10),
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
      customerId: string
      customerName: string
      current: number
      days1_15: number
      days16_30: number
      days31_45: number
      daysOver45: number
      total: number
    }>()

    for (const inv of invoices) {
      if (inv.dueAmount <= 0) continue
      const customerName = inv.customer?.name ?? "Unknown"
      if (search && !customerName.toLowerCase().includes(search.toLowerCase())) continue

      const daysOverdue = Math.floor((today.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const existing = agingMap.get(inv.customerId) ?? {
        customerId: inv.customerId,
        customerName,
        current: 0,
        days1_15: 0,
        days16_30: 0,
        days31_45: 0,
        daysOver45: 0,
        total: 0,
      }

      if (daysOverdue <= 0) existing.current += inv.dueAmount
      else if (daysOverdue <= 15) existing.days1_15 += inv.dueAmount
      else if (daysOverdue <= 30) existing.days16_30 += inv.dueAmount
      else if (daysOverdue <= 45) existing.days31_45 += inv.dueAmount
      else existing.daysOver45 += inv.dueAmount

      existing.total += inv.dueAmount
      agingMap.set(inv.customerId, existing)
    }

    const agingSummary = Array.from(agingMap.values())

    // --- Aging Details ---
    const agingDetails = invoices
      .filter(inv => inv.dueAmount > 0)
      .filter(inv => {
        const customerName = inv.customer?.name ?? ""
        return !search || 
          customerName.toLowerCase().includes(search.toLowerCase()) ||
          inv.invoiceId.toLowerCase().includes(search.toLowerCase())
      })
      .map(inv => {
        const daysOverdue = Math.floor((today.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          customerId: inv.customerId,
          customerName: inv.customer?.name ?? "Unknown",
          transaction: inv.invoiceId,
          date: inv.issueDate.toISOString().slice(0, 10),
          dueDate: inv.dueDate.toISOString().slice(0, 10),
          daysOverdue: Math.max(0, daysOverdue),
          balance: inv.dueAmount,
          status: getInvoiceStatus(inv.status, inv.dueDate, today),
        }
      })

    // Totals
    const totalBalance = customerBalance.reduce((sum, c) => sum + c.balance, 0)
    const agingSummaryTotals = agingSummary.reduce((acc, row) => ({
      current: acc.current + row.current,
      days1_15: acc.days1_15 + row.days1_15,
      days16_30: acc.days16_30 + row.days16_30,
      days31_45: acc.days31_45 + row.days31_45,
      daysOver45: acc.daysOver45 + row.daysOver45,
      total: acc.total + row.total,
    }), { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, daysOver45: 0, total: 0 })

    return NextResponse.json({
      success: true,
      data: {
        customerBalance,
        receivableSummary,
        receivableDetails,
        agingSummary,
        agingDetails,
        totalBalance,
        agingSummaryTotals,
      },
    })
  } catch (error) {
    console.error("Error fetching receivables report:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch receivables report" },
      { status: 500 }
    )
  }
}

function getInvoiceStatus(status: number, dueDate: Date, today: Date): string {
  if (status === 4) return "paid"
  if (status === 3) return "partial"
  if (dueDate < today) return "overdue"
  return "unpaid"
}
