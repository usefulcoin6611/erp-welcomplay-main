export async function seedAwardTypes(prisma: any) {
  console.log("Seeding Award Types...");

  const names: string[] = [
    "Employee of the Month",
    "Best Performer",
    "Team Player",
    "Long Service",
    "Innovation Award",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.awardType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.awardType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Award Type created: ${name}`);
  }

  console.log(`Award Types seeding completed. New records: ${createdCount}`);
}

