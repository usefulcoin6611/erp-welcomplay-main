export async function seedDeductionOptions(prisma: any) {
  console.log("Seeding Deduction Options...");

  type SeedDeductionOption = {
    name: string;
    description?: string;
  };

  const options: SeedDeductionOption[] = [
    {
      name: "Tax Deduction",
      description: "Potongan pajak penghasilan karyawan.",
    },
    {
      name: "Insurance Deduction",
      description: "Potongan untuk premi asuransi kesehatan/jiwa.",
    },
    {
      name: "Loan Repayment",
      description: "Potongan angsuran pinjaman karyawan.",
    },
    {
      name: "Other Deduction",
      description: "Potongan lain-lain sesuai kebijakan perusahaan.",
    },
  ];

  let createdCount = 0;

  for (const opt of options) {
    const existing = await prisma.deductionOption.findFirst({
      where: {
        name: opt.name,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.deductionOption.create({
      data: {
        name: opt.name,
        description: opt.description ?? null,
      },
    });

    createdCount++;
    console.log(`Deduction Option created: ${opt.name}`);
  }

  console.log(
    `Deduction Options seeding completed. New records: ${createdCount}`,
  );
}

