import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

type PosOrderItemInput = {
  productId?: string
  itemName: string
  sku?: string
  quantity: number
  price: number
  discount?: number
  taxRate?: number
}

function mapPosOrder(order: any) {
  return {
    id: order.id,
    posId: order.posId,
    customerId: order.customerId,
    customerName: order.customer?.name ?? "Walk-in Customer",
    warehouseId: order.warehouseId,
    warehouseName: order.warehouse?.name ?? "",
    branchId: order.branchId,
    discount: Number(order.discount) || 0,
    subtotal: Number(order.subtotal) || 0,
    total: Number(order.total) || 0,
    status: order.status,
    quotationId: order.quotationId ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      productId: item.productId ?? null,
      itemName: item.itemName,
      sku: item.sku ?? "",
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      discount: Number(item.discount) || 0,
      taxRate: Number(item.taxRate) || 0,
      subtotal: Number(item.subtotal) || 0,
    })),
  }
}

/**
 * GET /api/pos/orders
 * List POS orders with optional filters.
 *
 * Query params:
 *   - startDate: ISO date string
 *   - endDate: ISO date string
 *   - customerId: string
 *   - warehouseId: string
 *   - status: string
 *   - page: number (default 1)
 *   - limit: number (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const url = new URL(request.url)

    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const customerId = url.searchParams.get("customerId")
    const warehouseId = url.searchParams.get("warehouseId")
    const status = url.searchParams.get("status")
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "20", 10))

    const where: any = {}
    if (branchId) where.branchId = branchId
    if (customerId && customerId !== "all") where.customerId = customerId
    if (warehouseId && warehouseId !== "all") where.warehouseId = warehouseId
    if (status && status !== "all") where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const [total, orders] = await Promise.all([
      prisma.posOrder.count({ where }),
      prisma.posOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: orders.map(mapPosOrder),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching POS orders:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch POS orders" }, { status: 500 })
  }
}

/**
 * POST /api/pos/orders
 * Create a new POS order (store transaction).
 * Mirrors reference-erp pos/data/store endpoint.
 *
 * Body: {
 *   customerId?: string,
 *   warehouseId?: string,
 *   discount?: number,
 *   quotationId?: string,
 *   items: PosOrderItemInput[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const body = await request.json().catch(() => null)

    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    const items: PosOrderItemInput[] = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 })
    }

    // Validate customer if provided
    if (body.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: body.customerId } })
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 400 })
      }
    }

    // Validate warehouse if provided
    if (body.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({ where: { id: body.warehouseId } })
      if (!warehouse) {
        return NextResponse.json({ success: false, message: "Warehouse not found" }, { status: 400 })
      }
    }

    // Calculate totals
    const discount = Math.max(0, Number(body.discount) || 0)
    let subtotal = 0
    const processedItems = items.map((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0)
      const price = Math.max(0, Number(item.price) || 0)
      const itemDiscount = Math.max(0, Number(item.discount) || 0)
      const taxRate = Math.max(0, Number(item.taxRate) || 0)
      const itemSubtotal = qty * price * (1 - itemDiscount / 100) * (1 + taxRate / 100)
      subtotal += itemSubtotal
      return {
        productId: item.productId ?? null,
        itemName: item.itemName,
        sku: item.sku ?? null,
        quantity: qty,
        price,
        discount: itemDiscount,
        taxRate,
        subtotal: Math.round(itemSubtotal * 100) / 100,
      }
    })
    const total = Math.max(0, subtotal - discount)

    // Generate POS ID
    const count = await prisma.posOrder.count()
    const posId = `POS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

    const order = await prisma.posOrder.create({
      data: {
        posId,
        customerId: body.customerId ?? null,
        warehouseId: body.warehouseId ?? null,
        branchId,
        discount,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        status: "completed",
        quotationId: body.quotationId ?? null,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: true,
      },
    })

    return NextResponse.json({ success: true, data: mapPosOrder(order) }, { status: 201 })
  } catch (error) {
    console.error("Error creating POS order:", error)
    return NextResponse.json({ success: false, message: "Failed to create POS order" }, { status: 500 })
  }
}
