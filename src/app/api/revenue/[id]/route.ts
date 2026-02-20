import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

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
    console.error("Error updating revenue:", error)
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

    const formData = await request.formData()

    const date = formData.get("date")
    const amount = formData.get("amount")
    const cashAccountId = formData.get("cashAccountId")
    const incomeAccountId = formData.get("incomeAccountId")
    const customerId = formData.get("customerId")
    const reference = formData.get("reference")
    const description = formData.get("description")

    if (!date || !amount || !cashAccountId || !incomeAccountId) {
      return NextResponse.json(
        { success: false, message: "date, amount, cashAccountId, incomeAccountId wajib diisi" },
        { status: 400 }
      )
    }

    const amountNumber = typeof amount === "number" ? amount : Number(amount)

    if (!amountNumber || Number.isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { success: false, message: "amount harus berupa angka lebih dari 0" },
        { status: 400 }
      )
    }

    const [entry, cashAccount, incomeAccount, customer] = await Promise.all([
      prisma.journalEntry.findFirst({
        where: { id, branchId },
        include: { lines: true },
      }),
      prisma.chartOfAccount.findFirst({ where: { id: cashAccountId as string, type: "Assets", branchId } }),
      prisma.chartOfAccount.findFirst({ where: { id: incomeAccountId as string, type: "Income", branchId } }),
      customerId ? prisma.customer.findFirst({ where: { id: customerId as string, branchId } }) : Promise.resolve(null),
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

    let paymentReceipt: string | null | undefined = undefined
    const file = formData.get("paymentReceipt") as File | null
    const paymentReceiptRemoved = formData.get("paymentReceiptRemoved") === "true"

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`
      const uploadDir = path.join(process.cwd(), "public/uploads/revenue")

      try {
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, filename), buffer)
        paymentReceipt = `/uploads/revenue/${filename}`
      } catch (err) {
        console.error("Error saving revenue receipt file:", err)
      }
    } else if (paymentReceiptRemoved) {
      paymentReceipt = null
    }

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.update({
        where: { id },
        data: {
          date: parsedDate,
          description: description ? String(description) : null,
          reference: reference ? String(reference) : null,
          amount: amountNumber,
          paymentReceipt: paymentReceipt !== undefined ? paymentReceipt : (entry as any).paymentReceipt,
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
            accountId: cashAccountId as string,
            debit: amountNumber,
            credit: 0,
            description: description ? String(description) : null,
          },
        })
      }

      if (incomeLine) {
        await tx.journalLine.update({
          where: { id: incomeLine.id },
          data: {
            accountId: incomeAccountId as string,
            debit: 0,
            credit: amountNumber,
            description: description ? String(description) : null,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting revenue:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
