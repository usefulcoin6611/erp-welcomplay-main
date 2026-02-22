export async function seedCompetencies(prisma: any) {
  console.log("Seeding Competencies...");

  const names: string[] = [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Leadership",
    "Technical Skills",
    "Time Management",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.competency.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.competency.create({
      data: { name },
    });

    createdCount++;
    console.log(`Competency created: ${name}`);
  }

  console.log(`Competencies seeding completed. New records: ${createdCount}`);
}

