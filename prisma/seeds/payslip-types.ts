export async function seedPayslipTypes(prisma: any) {
  console.log("Seeding Payslip Types...");

  const names: string[] = ["Monthly", "Bi-Weekly", "Weekly", "Daily"];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.payslipType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.payslipType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Payslip Type created: ${name}`);
  }

  console.log(`Payslip Types seeding completed. New records: ${createdCount}`);
}
