export async function seedJobCategories(prisma: any) {
  console.log("Seeding Job Categories...");

  const names: string[] = [
    "IT",
    "Marketing",
    "Finance",
    "HR",
    "Operations",
    "Sales",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.jobCategory.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.jobCategory.create({
      data: { name },
    });

    createdCount++;
    console.log(`Job Category created: ${name}`);
  }

  console.log(`Job Categories seeding completed. New records: ${createdCount}`);
}

