import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const entry = await prisma.journalEntry.findFirst({
      where: { id, branchId },
    })

    if (!entry) {
      return NextResponse.json({ success: false, message: "Revenue entry tidak ditemukan" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.journalLine.deleteMany({ where: { journalEntryId: id } }),
      prisma.journalEntry.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const body = await request.json()
    const { date, amount, cashAccountId, incomeAccountId, customerId, paymentReceipt, reference, description } = body || {}

    if (!date || !amount || !cashAccountId || !incomeAccountId) {
      return NextResponse.json(
        { success: false, message: "date, amount, cashAccountId, incomeAccountId wajib diisi" },
        { status: 400 }
      )
    }

    const [entry, cashAccount, incomeAccount, customer] = await Promise.all([
      prisma.journalEntry.findFirst({
        where: { id, branchId },
        include: { lines: true },
      }),
      prisma.chartOfAccount.findFirst({ where: { id: cashAccountId, type: "Assets", branchId } }),
      prisma.chartOfAccount.findFirst({ where: { id: incomeAccountId, type: "Income", branchId } }),
      customerId ? prisma.customer.findFirst({ where: { id: customerId, branchId } }) : Promise.resolve(null),
    ])

    if (!entry) {
      return NextResponse.json({ success: false, message: "Revenue entry tidak ditemukan" }, { status: 404 })
    }

    if (!cashAccount || !incomeAccount) {
      return NextResponse.json(
        { success: false, message: "Akun kas (Assets) atau pendapatan (Income) tidak valid" },
        { status: 400 }
      )
    }

    if (customerId && !customer) {
      return NextResponse.json(
        { success: false, message: "Customer tidak ditemukan" },
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

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.update({
        where: { id },
        data: {
          date: parsedDate,
          description: description || null,
          reference: reference || null,
          amount: amount,
          customer: customer
            ? { connect: { id: customer.id } }
            : customerId === null
            ? { disconnect: true }
            : undefined,
        } as any,
      })

      const cashLine = entry.lines.find((ln) => ln.debit > 0) || entry.lines[0]
      const incomeLine = entry.lines.find((ln) => ln.credit > 0) || entry.lines[1]

      if (cashLine) {
        await tx.journalLine.update({
          where: { id: cashLine.id },
          data: {
            accountId: cashAccountId,
            debit: amount,
            credit: 0,
            description: description || null,
          },
        })
      }

      if (incomeLine) {
        await tx.journalLine.update({
          where: { id: incomeLine.id },
          data: {
            accountId: incomeAccountId,
            debit: 0,
            credit: amount,
            description: description || null,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
