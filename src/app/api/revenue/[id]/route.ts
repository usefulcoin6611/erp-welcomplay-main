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
    const bankAccountId = formData.get("bankAccountId")
    const cashAccountId = formData.get("cashAccountId")
    const incomeAccountId = formData.get("incomeAccountId")
    const customerId = formData.get("customerId")
    const reference = formData.get("reference")
    const description = formData.get("description")

    const effectiveCashAccountId =
      typeof bankAccountId === "string" && bankAccountId
        ? null
        : typeof cashAccountId === "string" && cashAccountId
        ? cashAccountId
        : null

    if (
      !date ||
      !amount ||
      (!bankAccountId && !effectiveCashAccountId) ||
      !incomeAccountId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "date, amount, bankAccountId/cashAccountId, incomeAccountId wajib diisi",
        },
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

    const [entry, bankAccount, cashAccount, incomeAccount, customer] = await Promise.all([
      prisma.journalEntry.findFirst({
        where: { id, branchId },
        include: { lines: true },
      }),
      typeof bankAccountId === "string" && bankAccountId
        ? prisma.bankAccount.findFirst({
            where: { id: bankAccountId as string, branchId },
            include: { chartAccount: true },
          })
        : Promise.resolve(null),
      effectiveCashAccountId
        ? prisma.chartOfAccount.findFirst({
            where: { id: effectiveCashAccountId, type: "Assets", branchId },
          })
        : Promise.resolve(null),
      prisma.chartOfAccount.findFirst({ where: { id: incomeAccountId as string, type: "Income", branchId } }),
      customerId ? prisma.customer.findFirst({ where: { id: customerId as string, branchId } }) : Promise.resolve(null),
    ])

    if (!entry) {
      return NextResponse.json({ success: false, message: "Revenue entry tidak ditemukan" }, { status: 404 })
    }

    const resolvedCashAccount =
      cashAccount ??
      (bankAccount && bankAccount.chartAccount.type === "Assets"
        ? bankAccount.chartAccount
        : null)

    if (!resolvedCashAccount || !incomeAccount) {
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
      const safeName = file.name.replace(/\s/g, "_")
      const shortPrefix = Date.now().toString(36)
      const filename = `${shortPrefix}_${safeName}`
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
          bankAccount: bankAccount ? { connect: { id: bankAccount.id } } : undefined,
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
            accountId: (resolvedCashAccount as any).id,
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
