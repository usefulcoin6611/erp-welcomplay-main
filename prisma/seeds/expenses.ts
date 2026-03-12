export async function seedExpenses(prisma: any) {
  const db = prisma as any
  console.log("Seeding expenses...")

  const branch = await db.branch.findFirst({
    orderBy: { createdAt: "asc" },
  })
  const branchId = branch?.id ?? null

  if (!branchId) {
    console.log("Skipping expense seed: branch not found.")
    return
  }

  const categories = await db.category.findMany({
    where: {
      branchId,
      type: "Expense",
    },
  })

  const categoryNames = new Set(categories.map((c: any) => c.name))

  const requiredNames = [
    "Office Supplies",
    "Transport",
    "Meals & Entertainment",
    "Operating Expense",
    "Utility",
  ]

  const missing = requiredNames.filter((n) => !categoryNames.has(n))
  if (missing.length > 0) {
    console.log(
      `Warning: some expense categories for seeding not found: ${missing.join(
        ", ",
      )}`,
    )
  }

  type SeedRow = {
    expenseId: string
    type: string
    party: string
    date: Date
    category: string
    total: number
    status: string
    reference?: string | null
    description?: string | null
  }

  const rows: SeedRow[] = [
    {
      expenseId: "EXP-2026-001",
      type: "Vendor",
      party: "OfficeMart",
      date: new Date("2026-02-05"),
      category: "Office Supplies",
      total: 1850000,
      status: "Paid",
      reference: "RCPT-2026-001",
      description: "Paper A4 80gsm",
    },
    {
      expenseId: "EXP-2026-002",
      type: "Vendor",
      party: "BlueBird Taxi",
      date: new Date("2026-02-06"),
      category: "Transport",
      total: 450000,
      status: "Paid",
      reference: "TRIP-2026-014",
      description: "USB Flash Drive 32GB",
    },
    {
      expenseId: "EXP-2026-003",
      type: "Vendor",
      party: "Coffee House",
      date: new Date("2026-02-07"),
      category: "Meals & Entertainment",
      total: 375000,
      status: "Paid",
      reference: "MEET-2026-007",
      description: "Whiteboard Marker",
    },
    {
      expenseId: "EXP-2026-004",
      type: "Vendor",
      party: "Coworking Space",
      date: new Date("2026-02-08"),
      category: "Operating Expense",
      total: 2500000,
      status: "Pending",
      reference: "INV-WS-2026-02",
      description: "Desk Lamp LED",
    },
    {
      expenseId: "EXP-2026-005",
      type: "Vendor",
      party: "State Electricity Company",
      date: new Date("2026-01-20"),
      category: "Utility",
      total: 3250000,
      status: "Paid",
      reference: "BILL-EL-2026-01",
      description: "Laptop Dell XPS 13",
    },
  ]

  for (const row of rows) {
    await db.expense.upsert({
      where: { expenseId: row.expenseId },
      update: {
        type: row.type,
        party: row.party,
        date: row.date,
        category: row.category,
        total: row.total,
        status: row.status,
        reference: row.reference ?? null,
        description: row.description ?? null,
        branchId,
      },
      create: {
        expenseId: row.expenseId,
        type: row.type,
        party: row.party,
        date: row.date,
        category: row.category,
        total: row.total,
        status: row.status,
        reference: row.reference ?? null,
        description: row.description ?? null,
        branchId,
      },
    })
  }

  console.log(`Seeded ${rows.length} expenses.`)
}
