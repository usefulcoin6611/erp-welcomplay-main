import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const inv = await prisma.invoice.findUnique({
      where: { invoiceId: id },
      include: { customer: true, items: true }
    })
    if (!inv) return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: inv })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await prisma.invoice.update({
      where: { invoiceId: id },
      data: {
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: typeof body.status === "number" ? body.status : undefined,
        dueAmount: typeof body.dueAmount === "number" ? body.dueAmount : undefined,
        description: body.description ?? undefined,
        customerId: typeof body.customerId === "string" && body.customerId !== "" ? body.customerId : undefined,
        categoryId: typeof body.categoryId === "string" && body.categoryId !== "" ? body.categoryId : undefined,
        items: Array.isArray(body.items)
          ? {
              deleteMany: {},
              create: body.items.map((it: any) => ({
                itemName: it.item,
                quantity: parseFloat(it.quantity) || 0,
                price: parseFloat(it.price) || 0,
                discount: parseFloat(it.discount) || 0,
                taxRate: parseFloat(it.taxRate) || 0,
                amount: typeof it.amount === "number" ? it.amount : 0,
                description: it.description ?? "",
              })),
            }
          : undefined,
      },
      include: { items: true }
    })
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.invoice.delete({
      where: { invoiceId: id }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete invoice" }, { status: 500 })
  }
}
