export async function seedTerminationTypes(prisma: any) {
  console.log("Seeding Termination Types...");

  const names: string[] = ["Misconduct", "Performance", "Voluntary", "Contract End"];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.terminationType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.terminationType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Termination Type created: ${name}`);
  }

  console.log(`Termination Types seeding completed. New records: ${createdCount}`);
}

