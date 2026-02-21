export async function seedGoalTypes(prisma: any) {
  console.log("Seeding Goal Types...");

  const names: string[] = [
    "KPI",
    "OKR",
    "Development Plan",
    "Performance Improvement",
    "Project Milestone",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.goalType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.goalType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Goal Type created: ${name}`);
  }

  console.log(`Goal Types seeding completed. New records: ${createdCount}`);
}

