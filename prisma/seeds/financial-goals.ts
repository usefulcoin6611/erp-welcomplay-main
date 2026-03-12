export async function seedFinancialGoals(prisma: any) {
  console.log("Seeding Financial Goals...")

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "asc" },
    take: 1,
  })

  if (branches.length === 0) {
    console.log("No branches found; skipping financial goals seeding (no branches).")
    return
  }

  const branch = branches[0]

  const existingCount = await prisma.financialGoal.count({
    where: { branchId: branch.id },
  })

  if (existingCount > 0) {
    console.log(`Financial goals already exist for branch ${branch.name}; skipping.`)
    return
  }

  await prisma.financialGoal.createMany({
    data: [
      {
        branchId: branch.id,
        name: "Increase Revenue",
        type: "Revenue",
        fromDate: new Date("2025-01-01T00:00:00.000Z"),
        toDate: new Date("2025-12-31T00:00:00.000Z"),
        amount: 500_000_000,
        isDisplay: true,
      },
      {
        branchId: branch.id,
        name: "Reduce Expenses",
        type: "Payment",
        fromDate: new Date("2025-01-01T00:00:00.000Z"),
        toDate: new Date("2025-12-31T00:00:00.000Z"),
        amount: 200_000_000,
        isDisplay: false,
      },
      {
        branchId: branch.id,
        name: "Increase Invoice Sales",
        type: "Invoice",
        fromDate: new Date("2025-01-01T00:00:00.000Z"),
        toDate: new Date("2025-12-31T00:00:00.000Z"),
        amount: 300_000_000,
        isDisplay: true,
      },
      {
        branchId: branch.id,
        name: "Reduce Bill Payments",
        type: "Bill",
        fromDate: new Date("2025-01-01T00:00:00.000Z"),
        toDate: new Date("2025-12-31T00:00:00.000Z"),
        amount: 150_000_000,
        isDisplay: false,
      },
      {
        branchId: branch.id,
        name: "Monthly Revenue Target",
        type: "Revenue",
        fromDate: new Date("2025-01-01T00:00:00.000Z"),
        toDate: new Date("2025-12-31T00:00:00.000Z"),
        amount: 600_000_000,
        isDisplay: true,
      },
    ],
  })

  console.log("Financial goals seeding completed.")
}

