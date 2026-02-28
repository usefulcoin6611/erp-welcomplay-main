import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/transaction
 * 
 * Returns transaction report data combining:
 * - Journal entries (double-entry)
 * - Bank transfers
 * - Payments
 * 
 * Query params:
 *   startMonth: YYYY-MM
 *   endMonth: YYYY-MM
 *   accountId: string (bank account filter)
 *   category: string (transaction category filter)
 *   search: string
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null
    if (!branchId) {
      return NextResponse.json({ success: false, message: "User has no assigned branch" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const startMonth = searchParams.get("startMonth") // YYYY-MM
    const endMonth = searchParams.get("endMonth") // YYYY-MM
    const accountId = searchParams.get("accountId")
    const category = searchParams.get("category")
    const search = searchParams.get("search") || ""

    // Build date range from month params
    const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00.000Z`) : undefined
    const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59.999Z`) : undefined

    const dateFilter: any = {}
    if (startDate) dateFilter.gte = startDate
    if (endDate) dateFilter.lte = endDate

    // Fetch journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        branchId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        ...(accountId && accountId !== "All" ? { bankAccountId: accountId } : {}),
        ...(search ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
            { journalId: { contains: search, mode: "insensitive" } },
          ]
        } : {}),
      },
      include: {
        bankAccount: true,
        lines: {
          include: { account: true },
        },
      },
      orderBy: { date: "desc" },
    })

    // Fetch bank transfers
    const bankTransfers = await prisma.bankTransfer.findMany({
      where: {
        branchId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        ...(search ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
          ]
        } : {}),
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { date: "desc" },
    })

    // Build transactions list
    const transactions: any[] = []

    // Add journal entries as transactions
    for (const je of journalEntries) {
      const totalDebit = je.lines.reduce((sum, l) => sum + l.debit, 0)
      const incomeLines = je.lines.filter(l => l.account.type === "Income")
      const expenseLines = je.lines.filter(l => ["Expenses", "Costs of Goods Sold"].includes(l.account.type))
      
      const txCategory = incomeLines.length > 0 ? "Income" : expenseLines.length > 0 ? "Expense" : "Transfer"
      
      if (category && category !== "All" && txCategory !== category) continue

      transactions.push({
        id: je.id,
        date: je.date.toISOString().slice(0, 10),
        type: "Journal Entry",
        reference: je.journalId,
        description: je.description || je.reference || je.journalId,
        account: je.bankAccount?.holderName ?? "General",
        category: txCategory,
        debit: totalDebit,
        credit: je.lines.reduce((sum, l) => sum + l.credit, 0),
        amount: je.amount,
      })
    }

    // Add bank transfers as transactions
    for (const bt of bankTransfers) {
      if (category && category !== "All" && category !== "Transfer") continue
      if (accountId && accountId !== "All" && bt.fromAccountId !== accountId && bt.toAccountId !== accountId) continue

      transactions.push({
        id: bt.id,
        date: bt.date.toISOString().slice(0, 10),
        type: "Bank Transfer",
        reference: bt.reference || `BT-${bt.id.slice(0, 8)}`,
        description: bt.description,
        account: `${bt.fromAccount?.holderName ?? "Unknown"} → ${bt.toAccount?.holderName ?? "Unknown"}`,
        category: "Transfer",
        debit: bt.amount,
        credit: bt.amount,
        amount: bt.amount,
      })
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Account summary
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { branchId },
      select: { id: true, holderName: true, bank: true, accountNumber: true },
      orderBy: { holderName: "asc" },
    })

    const accountSummary = bankAccounts.map(acc => ({
      id: acc.id,
      holderName: acc.holderName,
      bankName: acc.bank,
      accountNumber: acc.accountNumber,
    }))

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        accountSummary,
        totalRecords: transactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
