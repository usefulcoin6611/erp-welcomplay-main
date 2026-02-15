import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type CreditNoteApiRow = {
  id: string
  creditId: number
  invoice: string
  invoiceId: string
  date: string
  amount: number
  description: string
  status: number
}

export async function GET(request: NextRequest) {
  try {
    const notes = await (prisma as any).creditNote.findMany({
      include: {
        invoice: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    const data: CreditNoteApiRow[] = (notes as any[]).map((cn: any) => ({
      id: cn.id as string,
      creditId: cn.number as number,
      invoice: cn.invoice.invoiceId as string,
      invoiceId: cn.invoice.invoiceId as string,
      date: (cn.date as Date).toISOString().slice(0, 10),
      amount: cn.amount as number,
      description: (cn.description as string | null) || "-",
      status: cn.status as number,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch credit notes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, date, amount, description } = body || {}

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

    const count = await (prisma as any).creditNote.count()

    const created = await (prisma as any).creditNote.create({
      data: {
        number: count + 1,
        invoiceId: invoice.invoiceId,
        date: parsedDate,
        amount: numericAmount,
        description: description || "",
        status: 0,
      },
    })

    return NextResponse.json({ success: true, data: { id: created.id } })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create credit note" },
      { status: 500 }
    )
  }
}
