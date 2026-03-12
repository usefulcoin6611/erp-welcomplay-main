import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Invoice as InvoiceModel, Customer, Category, InvoiceItem } from "@prisma/client"

type InvoiceWithRelations = InvoiceModel & {
  customer: Customer
  items: InvoiceItem[]
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const status = url.searchParams.get("status")
    const customerId = url.searchParams.get("customerId")
    const search = url.searchParams.get("search")

    const where: any = {}

    // Date range filter
    if (startDate || endDate) {
      where.issueDate = {}
      if (startDate) where.issueDate.gte = new Date(startDate)
      if (endDate) where.issueDate.lte = new Date(endDate)
    }

    // Status filter (align with /accounting/sales?tab=invoice)
    // 0 Draft, 1 Sent, 2 Unpaid, 3 Partially Paid, 4 Paid
    if (status && status !== "all") {
      const parsed = parseInt(status, 10)
      if (!Number.isNaN(parsed)) {
        where.status = parsed
      }
    }

    // Customer filter (by customerId, same as invoice module)
    if (customerId && customerId !== "all") {
      where.customerId = customerId
    }

    // Search query
    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { issueDate: "desc" },
    }) as InvoiceWithRelations[]

    const categoryIds = Array.from(
      new Set(
        invoices
          .map((inv) => inv.categoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    )

    let categoryMap = new Map<string, string>()
    if (categoryIds.length > 0) {
      const categories: Category[] = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      })
      categoryMap = new Map(categories.map((c) => [c.id, c.name]))
    }

    // Calculate item totals since invoice only stores dueAmount/balance often
    // We need total amount of invoice
    const data = invoices.map((inv) => {
      // Calculate total from items
      const total = inv.items.reduce<number>(
        (sum, item) => sum + (item.amount || 0),
        0,
      )
      
      // Determine frontend status string
      let statusStr = 'unpaid'
      if (inv.status === 4) statusStr = 'paid'
      else if (inv.status === 3) statusStr = 'partial'
      else if (inv.dueDate < new Date() && inv.status !== 4) statusStr = 'overdue'
      
      return {
        id: inv.id,
        number: inv.invoiceId,
        customer: inv.customer?.name ?? '',
        issueDate: inv.issueDate.toISOString().slice(0, 10),
        category: categoryMap.get(inv.categoryId ?? '') ?? 'General',
        status: statusStr,
        total: total,
        balance: inv.dueAmount,
        paymentDate: inv.status === 4 ? inv.updatedAt.toISOString().slice(0, 10) : undefined,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching invoice summary:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoice summary" }, 
      { status: 500 }
    )
  }
}
