export async function seedPerformanceTypes(prisma: any) {
  console.log("Seeding Performance Types...");

  const names: string[] = [
    "Quarterly Review",
    "Annual Review",
    "Probation Review",
    "360 Feedback",
    "Project Evaluation",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.performanceType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.performanceType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Performance Type created: ${name}`);
  }

  console.log(
    `Performance Types seeding completed. New records: ${createdCount}`,
  );
}

