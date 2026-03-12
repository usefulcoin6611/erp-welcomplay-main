export async function seedLoanOptions(prisma: any) {
  console.log("Seeding Loan Options...");

  type SeedLoanOption = {
    name: string;
    description?: string;
  };

  const options: SeedLoanOption[] = [
    {
      name: "Personal Loan",
      description: "Pinjaman pribadi untuk kebutuhan umum karyawan.",
    },
    {
      name: "Emergency Loan",
      description: "Pinjaman darurat dengan proses persetujuan cepat.",
    },
    {
      name: "Education Loan",
      description: "Pinjaman untuk biaya pendidikan karyawan/keluarga.",
    },
  ];

  let createdCount = 0;

  for (const opt of options) {
    const existing = await prisma.loanOption.findFirst({
      where: {
        name: opt.name,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.loanOption.create({
      data: {
        name: opt.name,
        description: opt.description ?? null,
      },
    });

    createdCount++;
    console.log(`Loan Option created: ${opt.name}`);
  }

  console.log(`Loan Options seeding completed. New records: ${createdCount}`);
}

