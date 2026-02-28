import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/sales
 * 
 * Returns sales report data aggregated from invoices:
 * - by-item: aggregated by invoice item name
 * - by-customer: aggregated by customer
 * 
 * Query params:
 *   startDate, endDate: ISO date strings
 *   search: string
 *   type: 'items' | 'customers' (default: both)
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

    // Fetch invoices with items and customer
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

    // --- By Item aggregation ---
    const itemMap = new Map<string, {
      item: string
      quantity: number
      revenue: number
      avgPrice: number
      status: string
    }>()

    for (const inv of invoices) {
      for (const item of inv.items) {
        const key = item.itemName
        if (search && !key.toLowerCase().includes(search.toLowerCase())) continue
        const existing = itemMap.get(key)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.amount
        } else {
          itemMap.set(key, {
            item: key,
            quantity: item.quantity,
            revenue: item.amount,
            avgPrice: item.price,
            status: getItemStatus(item.amount),
          })
        }
      }
    }

    // Recalculate avgPrice after aggregation
    const byItem = Array.from(itemMap.values()).map((row) => ({
      ...row,
      avgPrice: row.quantity > 0 ? Math.round(row.revenue / row.quantity) : 0,
      status: getItemStatus(row.revenue),
    }))

    // --- By Customer aggregation ---
    const customerMap = new Map<string, {
      customerId: string
      customer: string
      orders: number
      revenue: number
      avgOrder: number
      priority: string
    }>()

    for (const inv of invoices) {
      const customerName = inv.customer?.name ?? "Unknown"
      if (search && !customerName.toLowerCase().includes(search.toLowerCase())) continue
      const invoiceTotal = inv.items.reduce((sum, it) => sum + it.amount, 0)
      const existing = customerMap.get(inv.customerId)
      if (existing) {
        existing.orders += 1
        existing.revenue += invoiceTotal
      } else {
        customerMap.set(inv.customerId, {
          customerId: inv.customerId,
          customer: customerName,
          orders: 1,
          revenue: invoiceTotal,
          avgOrder: invoiceTotal,
          priority: getCustomerPriority(invoiceTotal),
        })
      }
    }

    // Recalculate avgOrder and priority after aggregation
    const byCustomer = Array.from(customerMap.values()).map((row) => ({
      ...row,
      avgOrder: row.orders > 0 ? Math.round(row.revenue / row.orders) : 0,
      priority: getCustomerPriority(row.revenue),
    }))

    // Summary stats
    const totalRevenue = byItem.reduce((sum, r) => sum + r.revenue, 0)
    const totalOrders = byItem.reduce((sum, r) => sum + r.quantity, 0)
    const totalCustomers = byCustomer.length

    return NextResponse.json({
      success: true,
      data: {
        byItem,
        byCustomer,
        summary: {
          totalRevenue,
          totalOrders,
          totalCustomers,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching sales report:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch sales report" },
      { status: 500 }
    )
  }
}

function getItemStatus(revenue: number): string {
  if (revenue >= 100000000) return "Top Seller"
  if (revenue >= 50000000) return "Premium"
  if (revenue >= 20000000) return "Trending"
  return "Steady"
}

function getCustomerPriority(revenue: number): string {
  if (revenue >= 100000000) return "Strategic"
  if (revenue >= 50000000) return "Premium"
  if (revenue >= 20000000) return "Growth"
  return "Stable"
}
