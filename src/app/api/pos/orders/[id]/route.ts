import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

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
 * GET /api/pos/orders/[id]
 * Get a single POS order by id or posId.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    // Try to find by id first, then by posId
    const order = await prisma.posOrder.findFirst({
      where: { OR: [{ id }, { posId: id }] },
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    })

    if (!order) return NextResponse.json({ success: false, message: "POS order not found" }, { status: 404 })

    return NextResponse.json({ success: true, data: mapPosOrder(order) })
  } catch (error) {
    console.error("Error fetching POS order:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch POS order" }, { status: 500 })
  }
}

/**
 * DELETE /api/pos/orders/[id]
 * Delete a POS order (admin only).
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userRole = (session.user as any).role
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const order = await prisma.posOrder.findFirst({
      where: { OR: [{ id }, { posId: id }] },
    })
    if (!order) return NextResponse.json({ success: false, message: "POS order not found" }, { status: 404 })

    await prisma.posOrder.delete({ where: { id: order.id } })

    return NextResponse.json({ success: true, message: "POS order deleted" })
  } catch (error) {
    console.error("Error deleting POS order:", error)
    return NextResponse.json({ success: false, message: "Failed to delete POS order" }, { status: 500 })
  }
}
