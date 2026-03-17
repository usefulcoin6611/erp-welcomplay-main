import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

type RevenueApiRow = {
  id: string
  date: string
  amount: number
  account: string
  customerId: string | null
  category: string | null
  categoryId?: string | null
  reference: string | null
  description: string | null
  paymentReceipt: string | null
  cashAccountId?: string | null
  incomeAccountId?: string | null
  bankAccountId?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const userBranches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")

    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`)
    if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`)

    const [entries, incomeCategories] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          branch: {
            ownerId: companyId,
          },
        },
        include: {
          lines: {
            include: {
              account: true,
            },
          },
          bankAccount: true,
        },
        orderBy: {
          date: "desc",
        },
      }) as any[],
      prisma.category.findMany({
        where: {
          type: "Income",
          branch: {
            ownerId: companyId,
          },
        },
      }),
    ])

    const filteredEntries = entries;
    const filteredIncomeCategories = incomeCategories;

    const categoryByAccountName = new Map<string, { id: string; name: string }>()
    for (const cat of filteredIncomeCategories as any[]) {
      if (cat.account) {
        categoryByAccountName.set(cat.account, { id: cat.id, name: cat.name })
      }
    }

    const data = (filteredEntries as any[]).reduce<RevenueApiRow[]>((acc, entry: any) => {
      const incomeLines = entry.lines.filter((ln: any) => ln.account.type === "Income")
      const cashLines = entry.lines.filter((ln: any) => ln.account.type === "Assets")
      const incomeAmount = incomeLines.reduce(
        (sum: number, ln: any) => sum + ((ln.credit || 0) - (ln.debit || 0)),
        0
      )
      const cashLine = cashLines.find((ln: any) => (ln.debit || 0) > 0)
      if (incomeAmount > 0 && (!accountId || incomeLines.some((ln: any) => ln.account.id === accountId))) {
        const bankAccount = (entry as any).bankAccount as { id: string; holderName: string; bank: string } | null
        const accountLabel = bankAccount
          ? `${bankAccount.holderName} - ${bankAccount.bank}`
          : cashLine
          ? cashLine.account.name
          : "-"

        const incomeAccount = incomeLines[0]?.account
        const mappedCategory =
          incomeAccount && categoryByAccountName.get(incomeAccount.name as string)

        acc.push({
          id: entry.id,
          date: entry.date.toISOString().slice(0, 10),
          amount: incomeAmount,
          account: accountLabel,
          customerId: (entry as any).customerId ?? null,
          category: mappedCategory?.name ?? incomeAccount?.name ?? null,
          categoryId: mappedCategory?.id ?? null,
          reference: entry.reference || null,
          description: entry.description || null,
          paymentReceipt: (entry as any).paymentReceipt ?? null,
          cashAccountId: cashLine?.account.id ?? null,
          incomeAccountId: incomeAccount?.id ?? null,
          bankAccountId: (entry as any).bankAccountId ?? null,
        })
      }
      return acc
    }, [])

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const formData = await request.formData()

    const date = formData.get("date")
    const amount = formData.get("amount")
    const bankAccountId = formData.get("bankAccountId")
    const cashAccountId = formData.get("cashAccountId")
    const categoryId = formData.get("categoryId")
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
      typeof date !== "string" ||
      !date ||
      (!bankAccountId && !effectiveCashAccountId) ||
      typeof categoryId !== "string" ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "date, bankAccountId/cashAccountId, categoryId wajib diisi",
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

    let paymentReceipt: string | null = null
    const file = formData.get("paymentReceipt") as File | null

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
    }

    const [bankAccount, cashAccount, category, customer] = await Promise.all([
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
      prisma.category.findFirst({
        where: { id: categoryId as string, type: "Income", branchId },
      }),
      customerId && typeof customerId === "string"
        ? prisma.customer.findFirst({ where: { id: customerId as string, branchId } })
        : Promise.resolve(null),
    ])

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category pendapatan tidak valid" },
        { status: 400 }
      )
    }

    const incomeAccount = category.account
      ? await prisma.chartOfAccount.findFirst({
          where: {
            name: category.account,
            type: "Income",
            branchId,
          },
        })
      : null

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

    const result = await prisma.$transaction(async (tx: any) => {
      const entry = await tx.journalEntry.create({
        data: {
          journalId: `JR-${parsedDate.getFullYear()}-${Math.floor(Math.random() * 100000)}`,
          date: parsedDate,
          description: description ? String(description) : null,
          reference: reference ? String(reference) : null,
          amount: amountNumber,
          paymentReceipt,
          customer: customer ? { connect: { id: customer.id } } : undefined,
          branch: { connect: { id: branchId } },
          bankAccount: bankAccount ? { connect: { id: bankAccount.id } } : undefined,
        } as any,
      })

      await tx.journalLine.create({
        data: {
          journalEntryId: entry.id,
          accountId: (resolvedCashAccount as any).id,
          debit: amountNumber,
          credit: 0,
          description: description ? String(description) : null,
        },
      })

      await tx.journalLine.create({
        data: {
          journalEntryId: entry.id,
          accountId: (incomeAccount as any).id,
          debit: 0,
          credit: amountNumber,
          description: description ? String(description) : null,
        },
      })

      return entry
    })

    return NextResponse.json({ success: true, data: { id: result.id } })
  } catch (error: any) {
    console.error("Error creating revenue:", error)
    return NextResponse.json(
      { success: false, message: "Gagal membuat revenue" },
      { status: 500 }
    )
  }
}
