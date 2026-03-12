export async function seedDocumentTypes(prisma: any) {
  console.log("Seeding Document Types...");

  const names: string[] = [
    "KTP",
    "KK",
    "Passport",
    "SIM",
    "NPWP",
    "Employment Contract",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.documentType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.documentType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Document Type created: ${name}`);
  }

  console.log(`Document Types seeding completed. New records: ${createdCount}`);
}
