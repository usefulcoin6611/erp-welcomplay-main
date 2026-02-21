import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

async function getSessionBranch() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return { error: "Unauthorized", status: 401 as const, branchId: null as string | null }
  }
  const branchId = (session.user as any).branchId as string | null
  if (!branchId) {
    return { error: "User has no assigned branch", status: 400 as const, branchId: null }
  }
  return { error: null, status: 200 as const, branchId }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const s = await getSessionBranch()
    if (s.error || !s.branchId) {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status })
    }

    const bill = await prisma.bill.findUnique({
      where: { billId: id },
      include: {
        vendor: true,
        items: true,
      },
    })

    if (!bill || bill.branchId !== s.branchId) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: bill })
  } catch (error) {
    console.error("Error fetching bill detail:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail bill" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const s = await getSessionBranch()
    if (s.error || !s.branchId) {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status })
    }

    const body = await request.json().catch(() => ({}))
    const {
      vendorId,
      billDate,
      dueDate,
      categoryId,
      reference,
      description,
      status,
      total,
      items,
    } = body || {}

    const builtItems = await prisma.$transaction(async (tx) => {
      const branchId = s.branchId as string
      const rawItems: any[] = Array.isArray(items) ? items : []

      if (!rawItems.length) {
        return {
          error: "Minimal satu item produk wajib diisi",
          items: [] as any[],
        }
      }

      const normalized = rawItems.map((it) => {
        const productId =
          typeof it.productId === "string" && it.productId ? it.productId : null
        const quantity = Number(it.quantity) || 0
        const price = Number(it.price) || 0
        const discount = Number(it.discount) || 0
        const taxRate = Number(it.taxRate) || 0
        const description =
          typeof it.description === "string" && it.description
            ? String(it.description)
            : null

        return { productId, quantity, price, discount, taxRate, description }
      })

      if (normalized.some((it) => !it.productId)) {
        return {
          error: "Semua item wajib memilih Product/Service dari katalog",
          items: [] as any[],
        }
      }

      const productIds = Array.from(
        new Set(
          normalized
            .map((it) => it.productId)
            .filter((id): id is string => typeof id === "string" && !!id),
        ),
      )

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          branchId,
        },
      })

      const productMap = new Map<string, any>()
      for (const p of products) {
        if (typeof p.id === "string") {
          productMap.set(p.id, p)
        }
      }

      if (
        normalized.some(
          (it) => !it.productId || !productMap.has(it.productId as string),
        )
      ) {
        return {
          error: "Produk pada salah satu item tidak ditemukan di Products/Services",
          items: [] as any[],
        }
      }

      const built = normalized.map((it) => {
        const product = productMap.get(it.productId as string)
        const amount =
          (it.price || 0) * (it.quantity || 0) - (it.discount || 0)

        return {
          productId: it.productId as string,
          itemName: String(product?.name || ""),
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
          taxRate: it.taxRate,
          amount,
          description: it.description,
        }
      })

      return { error: null, items: built }
    })

    if (builtItems.error) {
      return NextResponse.json(
        { success: false, message: builtItems.error },
        { status: 400 },
      )
    }

    const bill = await prisma.bill.findUnique({
      where: { billId: id },
      include: { items: true },
    })

    if (!bill || bill.branchId !== s.branchId) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    const updated = await prisma.bill.update({
      where: { billId: id },
      data: {
        vendorId: vendorId ?? bill.vendorId,
        billDate: billDate ? new Date(billDate) : bill.billDate,
        dueDate: dueDate ? new Date(dueDate) : bill.dueDate,
        categoryId:
          typeof categoryId === "string" && categoryId
            ? categoryId
            : bill.categoryId,
        reference: reference ?? bill.reference,
        description: description ?? bill.description,
        status: status ?? bill.status,
        total: typeof total === "number" ? total : bill.total,
        items: Array.isArray(items)
          ? {
              deleteMany: { billId: bill.billId },
              create: builtItems.items,
            }
          : undefined,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui bill" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const s = await getSessionBranch()
    if (s.error || !s.branchId) {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status })
    }

    const bill = await prisma.bill.findUnique({
      where: { billId: id },
    })

    if (!bill || bill.branchId !== s.branchId) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    await prisma.bill.delete({
      where: { billId: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bill:", error)
    return NextResponse.json(
      { success: false, message: "Gagal menghapus bill" },
      { status: 500 },
    )
  }
}
