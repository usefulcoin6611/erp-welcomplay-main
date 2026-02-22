export async function seedTrainingTypes(prisma: any) {
  console.log("Seeding Training Types...");

  const names: string[] = [
    "Technical Training",
    "Soft Skills Training",
    "Leadership Training",
    "Onboarding",
    "Compliance Training",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.trainingType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.trainingType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Training Type created: ${name}`);
  }

  console.log(`Training Types seeding completed. New records: ${createdCount}`);
}

