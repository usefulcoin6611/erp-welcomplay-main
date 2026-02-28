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
