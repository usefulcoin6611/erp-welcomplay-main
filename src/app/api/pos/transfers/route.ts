import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

function mapTransfer(t: any) {
  return {
    id: t.id,
    transferId: t.transferId,
    fromWarehouseId: t.fromWarehouseId,
    fromWarehouseName: t.fromWarehouse?.name ?? '—',
    toWarehouseId: t.toWarehouseId,
    toWarehouseName: t.toWarehouse?.name ?? '—',
    productId: t.productId,
    productName: t.product?.name ?? '—',
    productSku: t.product?.sku ?? '',
    quantity: Number(t.quantity) || 0,
    note: t.note ?? null,
    branchId: t.branchId ?? null,
    transferDate: t.transferDate,
    createdAt: t.createdAt,
  }
}

/**
 * GET /api/pos/transfers
 * List all warehouse transfers.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const url = new URL(request.url)
    const fromWarehouseId = url.searchParams.get("fromWarehouseId")
    const toWarehouseId = url.searchParams.get("toWarehouseId")
    const productId = url.searchParams.get("productId")

    const where: any = {}
    if (branchId) where.branchId = branchId
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId
    if (toWarehouseId) where.toWarehouseId = toWarehouseId
    if (productId) where.productId = productId

    const transfers = await prisma.warehouseTransfer.findMany({
      where,
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { transferDate: "desc" },
    })

    return NextResponse.json({ success: true, data: transfers.map(mapTransfer) })
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch transfers" }, { status: 500 })
  }
}

/**
 * POST /api/pos/transfers
 * Create a new warehouse transfer.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const body = await request.json().catch(() => null)

    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    // Validation
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

    // Verify warehouses exist
    const [fromWarehouse, toWarehouse, product] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: body.fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: body.toWarehouseId } }),
      prisma.product.findUnique({ where: { id: body.productId } }),
    ])

    if (!fromWarehouse) return NextResponse.json({ success: false, message: "Source warehouse not found" }, { status: 400 })
    if (!toWarehouse) return NextResponse.json({ success: false, message: "Destination warehouse not found" }, { status: 400 })
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 400 })

    // Generate transfer ID
    const count = await prisma.warehouseTransfer.count()
    const transferId = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

    const transfer = await prisma.warehouseTransfer.create({
      data: {
        transferId,
        fromWarehouseId: body.fromWarehouseId,
        toWarehouseId: body.toWarehouseId,
        productId: body.productId,
        quantity,
        note: body.note ?? null,
        branchId,
        transferDate: body.transferDate ? new Date(body.transferDate) : new Date(),
      },
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({ success: true, data: mapTransfer(transfer) }, { status: 201 })
  } catch (error) {
    console.error("Error creating transfer:", error)
    return NextResponse.json({ success: false, message: "Failed to create transfer" }, { status: 500 })
  }
}
