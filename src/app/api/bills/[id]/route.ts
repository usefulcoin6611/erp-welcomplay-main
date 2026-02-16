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
              create: items.map((it: any) => ({
                itemName: String(it.itemName || ""),
                quantity: Number(it.quantity) || 0,
                price: Number(it.price) || 0,
                discount: Number(it.discount) || 0,
                taxRate: Number(it.taxRate) || 0,
                amount:
                  (Number(it.price) || 0) * (Number(it.quantity) || 0) -
                  (Number(it.discount) || 0),
                description: it.description ? String(it.description) : null,
              })),
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
