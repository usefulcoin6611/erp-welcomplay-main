import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

/**
 * GET /api/account-dashboard
 * Returns aggregated data for the Accounting dashboard. Uses optional branchId from session when present.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as { branchId?: string | null })?.branchId ?? null
    const customerWhere = branchId ? { branchId } : {}
    const vendorWhere = branchId ? { branchId } : {}
    const invoiceWhere = branchId ? { customer: { branchId } } : {}
    const billWhere = branchId ? { branchId } : {}
    const expenseWhere = branchId ? { branchId } : {}
    const bankAccountWhere = branchId ? { branchId } : {}
    const goalWhere = branchId ? { branchId } : {}

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const year = now.getFullYear()
    const monthStart = new Date(year, now.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999)
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0)
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999)

    const [
      totalCustomers,
      totalVendors,
      totalInvoices,
      totalBills,
      invoicesForIncome,
      billsForExpense,
      expensesForExpense,
      bankAccountsRaw,
      invoicesForChart,
      billsForChart,
      expensesForChart,
      recentInvoicesRaw,
      recentBillsRaw,
      goalsRaw,
      plan,
    ] = await Promise.all([
      prisma.customer.count({ where: customerWhere }),
      prisma.vendor.count({ where: vendorWhere }),
      prisma.invoice.count({ where: invoiceWhere }),
      prisma.bill.count({ where: billWhere }),
      prisma.invoice.findMany({
        where: invoiceWhere,
        include: { items: true, customer: true },
        orderBy: { issueDate: "desc" },
        take: 100,
      }),
      prisma.bill.findMany({
        where: billWhere,
        include: { vendor: true },
        orderBy: { billDate: "desc" },
        take: 100,
      }),
      prisma.expense.findMany({ where: expenseWhere, take: 500 }),
      prisma.bankAccount.findMany({
        where: { ...bankAccountWhere, status: "Active" },
        include: { chartAccount: { select: { type: true } } },
      }),
      prisma.invoice.findMany({
        where: { ...invoiceWhere, issueDate: { gte: yearStart, lte: yearEnd } },
        include: { items: true },
      }),
      prisma.bill.findMany({
        where: { ...billWhere, billDate: { gte: yearStart, lte: yearEnd } },
      }),
      prisma.expense.findMany({
        where: { ...expenseWhere, date: { gte: yearStart, lte: yearEnd } },
      }),
      prisma.invoice.findMany({
        where: invoiceWhere,
        include: { customer: true, items: true },
        orderBy: { issueDate: "desc" },
        take: 50,
      }),
      prisma.bill.findMany({
        where: billWhere,
        include: { vendor: true },
        orderBy: { billDate: "desc" },
        take: 50,
      }),
      prisma.financialGoal.findMany({
        where: { ...goalWhere, isDisplay: true },
        orderBy: { toDate: "desc" },
      }),
      prisma.plan.findFirst({ where: { isDisable: false }, select: { storageLimit: true } }),
    ])

    const invAmount = (inv: { items: { amount: number }[] }) =>
      inv.items.reduce((s, i) => s + (i.amount ?? 0), 0)

    let incomeToday = 0
    let expenseToday = 0
    let incomeThisMonth = 0
    let expenseThisMonth = 0
    for (const inv of invoicesForIncome) {
      const amt = invAmount(inv)
      if (inv.issueDate >= todayStart && inv.issueDate <= todayEnd) incomeToday += amt
      if (inv.issueDate >= monthStart && inv.issueDate <= monthEnd) incomeThisMonth += amt
    }
    for (const b of billsForExpense) {
      if (b.billDate >= todayStart && b.billDate <= todayEnd) expenseToday += b.total
      if (b.billDate >= monthStart && b.billDate <= monthEnd) expenseThisMonth += b.total
    }
    for (const e of expensesForExpense) {
      if (e.date >= todayStart && e.date <= todayEnd) expenseToday += e.total
      if (e.date >= monthStart && e.date <= monthEnd) expenseThisMonth += e.total
    }

    const bankAccounts = bankAccountsRaw.map((a) => ({
      id: a.id,
      bank: a.bank,
      holderName: a.holderName,
      accountNumber: a.accountNumber,
      balance: a.openingBalance,
      type: a.chartAccount?.type ?? "Checking",
    }))

    const monthlyIncome = Array(12).fill(0)
    const monthlyExpense = Array(12).fill(0)
    for (const inv of invoicesForChart) {
      const m = inv.issueDate.getMonth()
      monthlyIncome[m] += invAmount(inv)
    }
    for (const b of billsForChart) {
      monthlyExpense[b.billDate.getMonth()] += b.total
    }
    for (const e of expensesForChart) {
      monthlyExpense[e.date.getMonth()] += e.total
    }

    const incomeExpenseChart = MONTH_NAMES.map((month, i) => ({
      month,
      income: Math.round(monthlyIncome[i]),
      expense: Math.round(monthlyExpense[i]),
    }))

    const cashflowChart = MONTH_NAMES.slice(0, 6).map((month, i) => ({
      month,
      income: Math.round(monthlyIncome[i]),
      expense: Math.round(monthlyExpense[i]),
    }))

    const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")} ${MONTH_SHORT[d.getMonth()]}, ${d.getFullYear()}`

    const latestIncome = invoicesForIncome.slice(0, 15).map((inv, i) => ({
      id: i + 1,
      date: formatDate(inv.issueDate),
      customer: inv.customer?.name ?? "",
      amountDue: invAmount(inv),
    }))

    const latestExpense = billsForExpense.slice(0, 15).map((b, i) => ({
      id: i + 1,
      date: formatDate(b.billDate),
      vendor: b.vendor?.name ?? "",
      amountDue: b.total,
    }))

    const categoryIds = Array.from(
      new Set(invoicesForChart.map((inv) => inv.categoryId).filter(Boolean)) as Set<string>
    )
    const categories =
      categoryIds.length > 0
        ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
        : []
    const catMap = new Map(categories.map((c) => [c.id, c.name]))
    const incomeByCategoryMap = new Map<string, number>()
    for (const inv of invoicesForChart) {
      const name = inv.categoryId ? catMap.get(inv.categoryId) ?? "Other" : "General"
      incomeByCategoryMap.set(name, (incomeByCategoryMap.get(name) ?? 0) + invAmount(inv))
    }
    const incomeByCategoryTotal = Array.from(incomeByCategoryMap.values()).reduce((a, b) => a + b, 0)
    const incomeByCategory =
      incomeByCategoryTotal > 0
        ? (() => {
            const entries = Array.from(incomeByCategoryMap.entries())
            const maintenanceSum = entries.filter(([k]) => /maintenance|service/i.test(k)).reduce((s, [, v]) => s + v, 0)
            const productSum = incomeByCategoryTotal - maintenanceSum
            const maintenancePct = Math.round((maintenanceSum / incomeByCategoryTotal) * 100)
            const productPct = 100 - maintenancePct
            const result: { category: string; amount: number; fill: string }[] = []
            if (maintenancePct > 0) result.push({ category: "maintenance", amount: maintenancePct, fill: "var(--color-maintenance)" })
            if (productPct > 0) result.push({ category: "product", amount: productPct, fill: "var(--color-product)" })
            return result.length ? result : [{ category: "product", amount: 100, fill: "var(--color-product)" }]
          })()
        : [{ category: "product", amount: 100, fill: "var(--color-product)" }]

    const expenseByCategoryMap = new Map<string, number>()
    for (const e of expensesForChart) {
      expenseByCategoryMap.set(e.category, (expenseByCategoryMap.get(e.category) ?? 0) + e.total)
    }
    for (const b of billsForChart) {
      expenseByCategoryMap.set("Bill", (expenseByCategoryMap.get("Bill") ?? 0) + b.total)
    }
    const expenseByCategoryTotal = Array.from(expenseByCategoryMap.values()).reduce((a, b) => a + b, 0)
    const expenseByCategory =
      expenseByCategoryTotal > 0
        ? (() => {
            const rentSum = Array.from(expenseByCategoryMap.entries())
              .filter(([k]) => /rent|lease|office|bill/i.test(k))
              .reduce((s, [, v]) => s + v, 0)
            const travelSum = Array.from(expenseByCategoryMap.entries())
              .filter(([k]) => /travel|transport/i.test(k))
              .reduce((s, [, v]) => s + v, 0)
            const otherSum = expenseByCategoryTotal - rentSum - travelSum
            const rPct = Math.round(((rentSum + otherSum) / expenseByCategoryTotal) * 100)
            const tPct = 100 - rPct
            const result: { category: string; amount: number; fill: string }[] = []
            if (rPct > 0) result.push({ category: "rentOrLease", amount: rPct, fill: "var(--color-rentOrLease)" })
            if (tPct > 0) result.push({ category: "travel", amount: tPct, fill: "var(--color-travel)" })
            return result.length ? result : [{ category: "rentOrLease", amount: 50, fill: "var(--color-rentOrLease)" }, { category: "travel", amount: 50, fill: "var(--color-travel)" }]
          })()
        : [
            { category: "rentOrLease", amount: 50, fill: "var(--color-rentOrLease)" },
            { category: "travel", amount: 50, fill: "var(--color-travel)" },
          ]

    const statusToFront = (inv: { status: number; dueDate: Date }) => {
      if (inv.status === 4) return "paid"
      if (inv.dueDate < now && inv.status !== 4) return "overdue"
      return "unpaid"
    }
    const recentInvoices = recentInvoicesRaw.slice(0, 15).map((inv, i) => ({
      id: i + 1,
      number: inv.invoiceId,
      customer: inv.customer?.name ?? "",
      issueDate: formatDate(inv.issueDate),
      dueDate: formatDate(inv.dueDate),
      amount: invAmount(inv),
      status: statusToFront(inv),
    }))

    const billStatusToFront = (s: string) => {
      const lower = (s || "").toLowerCase()
      if (lower === "paid") return "paid"
      if (lower === "unpaid" || lower === "draft" || lower === "sent") return "unpaid"
      if (lower === "partial") return "unpaid"
      return "overdue"
    }
    const recentBills = recentBillsRaw.slice(0, 15).map((b, i) => ({
      id: i + 1,
      number: b.billId,
      vendor: b.vendor?.name ?? "",
      billDate: formatDate(b.billDate),
      dueDate: formatDate(b.dueDate),
      amount: b.total,
      status: b.dueDate < now && b.status !== "paid" ? "overdue" : billStatusToFront(b.status),
    }))

    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)
    const thisWeekEnd = new Date(thisWeekStart)
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6)
    thisWeekEnd.setHours(23, 59, 59, 999)

    let invWeeklyGenerated = 0
    let invWeeklyPaid = 0
    let invMonthlyGenerated = 0
    let invMonthlyPaid = 0
    for (const inv of invoicesForIncome) {
      const amt = invAmount(inv)
      if (inv.issueDate >= thisWeekStart && inv.issueDate <= thisWeekEnd) invWeeklyGenerated += amt
      if (inv.issueDate >= monthStart && inv.issueDate <= monthEnd) invMonthlyGenerated += amt
      if (inv.status === 4) {
        if (inv.updatedAt >= thisWeekStart && inv.updatedAt <= thisWeekEnd) invWeeklyPaid += amt
        if (inv.updatedAt >= monthStart && inv.updatedAt <= monthEnd) invMonthlyPaid += amt
      }
    }
    let billWeeklyGenerated = 0
    let billWeeklyPaid = 0
    let billMonthlyGenerated = 0
    let billMonthlyPaid = 0
    for (const b of billsForExpense) {
      if (b.billDate >= thisWeekStart && b.billDate <= thisWeekEnd) billWeeklyGenerated += b.total
      if (b.billDate >= monthStart && b.billDate <= monthEnd) billMonthlyGenerated += b.total
      if (b.status === "paid") {
        if (b.updatedAt >= thisWeekStart && b.updatedAt <= thisWeekEnd) billWeeklyPaid += b.total
        if (b.updatedAt >= monthStart && b.updatedAt <= monthEnd) billMonthlyPaid += b.total
      }
    }

    const invoiceStats = {
      weekly: {
        totalGenerated: Math.round(invWeeklyGenerated),
        totalPaid: Math.round(invWeeklyPaid),
        totalDue: Math.round(invWeeklyGenerated - invWeeklyPaid),
      },
      monthly: {
        totalGenerated: Math.round(invMonthlyGenerated),
        totalPaid: Math.round(invMonthlyPaid),
        totalDue: Math.round(invMonthlyGenerated - invMonthlyPaid),
      },
    }

    const billStats = {
      weekly: {
        totalGenerated: Math.round(billWeeklyGenerated),
        totalPaid: Math.round(billWeeklyPaid),
        totalDue: Math.round(billWeeklyGenerated - billWeeklyPaid),
      },
      monthly: {
        totalGenerated: Math.round(billMonthlyGenerated),
        totalPaid: Math.round(billMonthlyPaid),
        totalDue: Math.round(billMonthlyGenerated - billMonthlyPaid),
      },
    }

    const goals = goalsRaw.map((g, i) => {
      let goalCurrent = 0
      if (g.type === "revenue" || g.type === "invoice") {
        goalCurrent = invoicesForIncome
          .filter((inv) => inv.issueDate >= g.fromDate && inv.issueDate <= g.toDate)
          .reduce((s, inv) => s + invAmount(inv), 0)
      } else if (g.type === "bill" || g.type === "payment") {
        goalCurrent = billsForExpense
          .filter((b) => b.billDate >= g.fromDate && b.billDate <= g.toDate && b.status === "paid")
          .reduce((s, b) => s + b.total, 0)
      }
      const target = g.amount || 1
      const progress = Math.min(100, Math.round((goalCurrent / target) * 100))
      return {
        id: i + 1,
        name: g.name,
        type: (g.type === "bill" || g.type === "invoice" || g.type === "payment" || g.type === "revenue" ? g.type : "revenue") as "bill" | "invoice" | "payment" | "revenue",
        duration: { start: formatDate(g.fromDate), end: formatDate(g.toDate) },
        current: goalCurrent,
        target: g.amount,
        progress,
      }
    })

    const storageLimitMB = plan?.storageLimit != null && plan.storageLimit >= 0 ? plan.storageLimit : null

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalCustomers, totalVendors, totalInvoices, totalBills },
        incomeVsExpense: {
          incomeToday: Math.round(incomeToday),
          expenseToday: Math.round(expenseToday),
          incomeThisMonth: Math.round(incomeThisMonth),
          expenseThisMonth: Math.round(expenseThisMonth),
        },
        bankAccounts,
        incomeExpenseChart,
        cashflowChart,
        latestIncome,
        latestExpense,
        incomeByCategory,
        expenseByCategory,
        recentInvoices,
        invoiceStats,
        recentBills,
        billStats,
        goals,
        storage: { usedMB: 0, limitMB: storageLimitMB },
      },
    })
  } catch (error) {
    console.error("Account dashboard API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
