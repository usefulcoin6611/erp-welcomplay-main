import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos/transfers/[id]
 * Get a single warehouse transfer by id or transferId.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const transfer = await prisma.warehouseTransfer.findFirst({
      where: { OR: [{ id }, { transferId: id }] },
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    if (!transfer) return NextResponse.json({ success: false, message: "Transfer not found" }, { status: 404 })

    return NextResponse.json({
      success: true,
      data: {
        id: transfer.id,
        transferId: transfer.transferId,
        fromWarehouseId: transfer.fromWarehouseId,
        fromWarehouseName: transfer.fromWarehouse?.name ?? '—',
        toWarehouseId: transfer.toWarehouseId,
        toWarehouseName: transfer.toWarehouse?.name ?? '—',
        productId: transfer.productId,
        productName: transfer.product?.name ?? '—',
        productSku: transfer.product?.sku ?? '',
        quantity: Number(transfer.quantity) || 0,
        note: transfer.note ?? null,
        branchId: transfer.branchId ?? null,
        transferDate: transfer.transferDate,
        createdAt: transfer.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching transfer:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch transfer" }, { status: 500 })
  }
}

/**
 * PUT /api/pos/transfers/[id]
 * Update a warehouse transfer (by id or transferId).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    const existing = await prisma.warehouseTransfer.findFirst({
      where: { OR: [{ id }, { transferId: id }] },
    })
    if (!existing) return NextResponse.json({ success: false, message: "Transfer not found" }, { status: 404 })

    if (!body.fromWarehouseId) {
      return NextResponse.json({ success: false, message: "Source warehouse is required" }, { status: 400 })
    }
    if (!body.toWarehouseId) {
      return NextResponse.json({ success: false, message: "Destination warehouse is required" }, { status: 400 })
    }
    if (body.fromWarehouseId === body.toWarehouseId) {
      return NextResponse.json({ success: false, message: "Source and destination warehouse cannot be the same" }, { status: 400 })
    }
    if (!body.productId) {
      return NextResponse.json({ success: false, message: "Product is required" }, { status: 400 })
    }
    const quantity = Number(body.quantity)
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: "Quantity must be greater than 0" }, { status: 400 })
    }

    const [fromWarehouse, toWarehouse, product] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: body.fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: body.toWarehouseId } }),
      prisma.product.findUnique({ where: { id: body.productId } }),
    ])
    if (!fromWarehouse) return NextResponse.json({ success: false, message: "Source warehouse not found" }, { status: 400 })
    if (!toWarehouse) return NextResponse.json({ success: false, message: "Destination warehouse not found" }, { status: 400 })
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 400 })

    const updated = await prisma.warehouseTransfer.update({
      where: { id: existing.id },
      data: {
        fromWarehouseId: body.fromWarehouseId,
        toWarehouseId: body.toWarehouseId,
        productId: body.productId,
        quantity,
        note: body.note ?? null,
        transferDate: body.transferDate ? new Date(body.transferDate) : existing.transferDate,
      },
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        transferId: updated.transferId,
        fromWarehouseId: updated.fromWarehouseId,
        fromWarehouseName: updated.fromWarehouse?.name ?? "—",
        toWarehouseId: updated.toWarehouseId,
        toWarehouseName: updated.toWarehouse?.name ?? "—",
        productId: updated.productId,
        productName: updated.product?.name ?? "—",
        productSku: updated.product?.sku ?? "",
        quantity: Number(updated.quantity) || 0,
        note: updated.note ?? null,
        branchId: updated.branchId ?? null,
        transferDate: updated.transferDate,
        createdAt: updated.createdAt,
      },
    })
  } catch (error) {
    console.error("Error updating transfer:", error)
    return NextResponse.json({ success: false, message: "Failed to update transfer" }, { status: 500 })
  }
}

/**
 * DELETE /api/pos/transfers/[id]
 * Delete a warehouse transfer.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const transfer = await prisma.warehouseTransfer.findFirst({
      where: { OR: [{ id }, { transferId: id }] },
    })

    if (!transfer) return NextResponse.json({ success: false, message: "Transfer not found" }, { status: 404 })

    await prisma.warehouseTransfer.delete({ where: { id: transfer.id } })

    return NextResponse.json({ success: true, message: "Transfer deleted successfully" })
  } catch (error) {
    console.error("Error deleting transfer:", error)
    return NextResponse.json({ success: false, message: "Failed to delete transfer" }, { status: 500 })
  }
}
