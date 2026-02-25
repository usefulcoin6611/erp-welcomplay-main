/**
 * Ensures all data required for Set Salary edit page exists.
 * Run after: branches, COA, bank-accounts, allowance/loan/deduction options, payslip types, employees.
 */
export async function seedSetSalary(prisma: any) {
  console.log("Seeding Set Salary data...");

  const branch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  if (!branch) {
    console.log("Skipping Set Salary: no branch found.");
    return;
  }

  // Ensure COA 1120, 1121 exist (for payroll bank accounts)
  const coa1120 = await prisma.chartOfAccount.findUnique({ where: { code: "1120" } });
  const coa1121 = await prisma.chartOfAccount.findUnique({ where: { code: "1121" } });
  if (!coa1120 || !coa1121) {
    console.log("Set Salary: COA 1120/1121 missing. Run seedCOA first.");
  }

  // Ensure payroll bank accounts exist
  const payrollBanks = await prisma.bankAccount.findMany({
    where: {
      chartAccountId: { in: [coa1120?.id, coa1121?.id].filter(Boolean) as string[] },
    },
    include: { chartAccount: true },
  });
  if (payrollBanks.length === 0 && coa1120 && coa1121) {
    const existingByNumber = await prisma.bankAccount.findFirst({
      where: { accountNumber: "1234567890" },
    });
    if (!existingByNumber) {
      await prisma.bankAccount.create({
        data: {
          chartAccountId: coa1120.id,
          holderName: "Payroll Account BCA",
          bank: "Bank BCA",
          accountNumber: "1234567890",
          openingBalance: 150000000,
          contactNumber: "+62 812-1111-2222",
          bankAddress: "KCP Sudirman Jakarta",
          paymentGateway: "Cash",
          branchId: branch.id,
        },
      });
      await prisma.bankAccount.create({
        data: {
          chartAccountId: coa1121.id,
          holderName: "Payroll Account Mandiri",
          bank: "Bank Mandiri",
          accountNumber: "223344556677",
          openingBalance: 95000000,
          contactNumber: "+62 812-9999-0000",
          bankAddress: "KCP Thamrin Jakarta",
          paymentGateway: "Cash",
          branchId: branch.id,
        },
      });
      console.log("Set Salary: created payroll bank accounts.");
    }
  }

  // Ensure allowance options exist
  const allowanceCount = await prisma.allowanceOption.count();
  if (allowanceCount === 0) {
    await prisma.allowanceOption.createMany({
      data: [
        { name: "Housing Allowance", description: "Tunjangan perumahan bulanan." },
        { name: "Transportation Allowance", description: "Tunjangan transportasi." },
        { name: "Meal Allowance", description: "Tunjangan makan harian." },
        { name: "Health Allowance", description: "Tunjangan kesehatan tambahan." },
      ],
    });
    console.log("Set Salary: created allowance options.");
  }

  // Ensure loan options exist
  const loanCount = await prisma.loanOption.count();
  if (loanCount === 0) {
    await prisma.loanOption.createMany({
      data: [
        { name: "Personal Loan", description: "Pinjaman pribadi." },
        { name: "Emergency Loan", description: "Pinjaman darurat." },
        { name: "Education Loan", description: "Pinjaman pendidikan." },
      ],
    });
    console.log("Set Salary: created loan options.");
  }

  // Ensure deduction options exist
  const deductionCount = await prisma.deductionOption.count();
  if (deductionCount === 0) {
    await prisma.deductionOption.createMany({
      data: [
        { name: "Tax Deduction", description: "Potongan pajak." },
        { name: "Insurance Deduction", description: "Potongan asuransi." },
        { name: "Loan Repayment", description: "Potongan angsuran pinjaman." },
        { name: "Other Deduction", description: "Potongan lain-lain." },
      ],
    });
    console.log("Set Salary: created deduction options.");
  }

  // Ensure payslip types exist
  const payslipMonthly = await prisma.payslipType.findFirst({ where: { name: "Monthly" } });
  if (!payslipMonthly) {
    await prisma.payslipType.createMany({
      data: [
        { name: "Monthly" },
        { name: "Bi-Weekly" },
        { name: "Weekly" },
        { name: "Daily" },
      ],
    });
    console.log("Set Salary: created payslip types.");
  }

  // Ensure all employees have basicSalary and salaryType
  const employeesWithoutSalary = await prisma.employee.findMany({
    where: {
      OR: [{ basicSalary: null }, { salaryType: null }],
    },
  });
  const defaultSalary = 10_000_000;
  for (const emp of employeesWithoutSalary) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        basicSalary: emp.basicSalary ?? defaultSalary,
        salaryType: emp.salaryType ?? "Monthly",
      },
    });
    console.log(`Set Salary: updated employee ${emp.name} with default salary.`);
  }

  // Seed sample allowances/commissions for first employee (for CRUD verification)
  const hasEmployeeAllowance = Boolean((prisma as any).employeeAllowance);
  if (hasEmployeeAllowance) {
    const firstEmp = await prisma.employee.findFirst({ orderBy: { createdAt: "asc" } });
    const firstAllowance = await prisma.allowanceOption.findFirst();
    const firstLoan = await prisma.loanOption.findFirst();
    const firstDeduction = await prisma.deductionOption.findFirst();
    if (firstEmp && firstAllowance && firstLoan && firstDeduction) {
      const existingAllowance = await (prisma as any).employeeAllowance.findFirst({
        where: { employeeId: firstEmp.id },
      });
      if (!existingAllowance) {
        await (prisma as any).employeeAllowance.create({
          data: {
            employeeId: firstEmp.id,
            allowanceOptionId: firstAllowance.id,
            title: "Housing Allowance",
            amount: 1000000,
            type: "Fixed",
          },
        });
        await (prisma as any).employeeCommission.create({
          data: {
            employeeId: firstEmp.id,
            title: "Sales Commission",
            amount: 500000,
            type: "Fixed",
          },
        });
        await (prisma as any).employeeOvertime.create({
          data: {
            employeeId: firstEmp.id,
            title: "Overtime Jan",
            days: 5,
            hours: 2,
            rate: 50000,
          },
        });
        console.log("Set Salary: created sample allowance/commission/overtime for first employee.");
      }
    }
  }

  console.log("Set Salary seeding completed.");
}
