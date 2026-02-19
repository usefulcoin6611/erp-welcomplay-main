export async function seedBudgets(prisma: any) {
  console.log("Seeding budget plans...")

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "asc" },
    take: 1,
  })

  if (branches.length === 0) {
    console.log("No branches found; skipping budget plans seeding (no branches).")
    return
  }

  const branch = branches[0]

  const existingCount = await prisma.budgetPlan.count({
    where: { branchId: branch.id },
  })

  if (existingCount > 0) {
    console.log(`Budget plans already exist for branch ${branch.name}; skipping.`)
    return
  }

  await prisma.budgetPlan.createMany({
    data: [
      {
        branchId: branch.id,
        name: "Monthly Budget Plan",
        fromYear: 2025,
        period: "Monthly",
      },
      {
        branchId: branch.id,
        name: "Quarterly Budget Plan",
        fromYear: 2025,
        period: "Quarterly",
      },
      {
        branchId: branch.id,
        name: "Half-Yearly Budget Plan",
        fromYear: 2025,
        period: "Half Yearly",
      },
      {
        branchId: branch.id,
        name: "Yearly Budget Plan",
        fromYear: 2025,
        period: "Yearly",
      },
    ],
  })

  console.log("Budget plans seeding completed.")
}
