import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { invoiceId, date, amount, description } = body || {}

    const existing = await (prisma as any).creditNote.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Credit note tidak ditemukan" },
        { status: 404 }
      )
    }

    if (!invoiceId || !date) {
      return NextResponse.json(
        { success: false, message: "invoiceId dan date wajib diisi" },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 400 }
      )
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 }
      )
    }

    const numericAmount = typeof amount === "number" ? amount : Number(amount || 0)
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json(
        { success: false, message: "Amount tidak valid" },
        { status: 400 }
      )
    }

    await (prisma as any).creditNote.update({
      where: { id },
      data: {
        invoiceId: invoice.invoiceId,
        date: parsedDate,
        amount: numericAmount,
        description: description || "",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update credit note" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await (prisma as any).creditNote.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Credit note tidak ditemukan" },
        { status: 404 }
      )
    }

    await (prisma as any).creditNote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete credit note" },
      { status: 500 }
    )
  }
}
