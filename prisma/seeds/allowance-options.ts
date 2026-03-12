export async function seedAllowanceOptions(prisma: any) {
  console.log("Seeding Allowance Options...");

  type SeedAllowanceOption = {
    name: string;
    description?: string;
  };

  const options: SeedAllowanceOption[] = [
    {
      name: "Housing Allowance",
      description: "Tunjangan perumahan bulanan untuk karyawan.",
    },
    {
      name: "Transportation Allowance",
      description: "Tunjangan transportasi harian/bulanan.",
    },
    {
      name: "Meal Allowance",
      description: "Tunjangan makan harian.",
    },
    {
      name: "Health Allowance",
      description: "Tunjangan kesehatan tambahan di luar BPJS.",
    },
  ];

  let createdCount = 0;

  for (const opt of options) {
    const existing = await prisma.allowanceOption.findFirst({
      where: {
        name: opt.name,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.allowanceOption.create({
      data: {
        name: opt.name,
        description: opt.description ?? null,
      },
    });

    createdCount++;
    console.log(`Allowance Option created: ${opt.name}`);
  }

  console.log(
    `Allowance Options seeding completed. New records: ${createdCount}`,
  );
}

