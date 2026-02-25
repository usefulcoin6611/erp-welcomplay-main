/**
 * Ensures employee payroll tables exist (allowance, commission, loan, etc.).
 * Safe to run multiple times.
 */
export async function ensurePayrollEmployeeSchema(prisma: any) {
  console.log("Ensuring employee payroll tables...");

  const tables = [
    `CREATE TABLE IF NOT EXISTS "employee_allowance" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "allowanceOptionId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'Fixed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_allowance_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_commission" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'Fixed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_commission_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_loan" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "loanOptionId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "reason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_loan_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_saturation_deduction" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "deductionOptionId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'Fixed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_saturation_deduction_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_other_payment" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'Fixed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_other_payment_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_overtime" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "days" INTEGER NOT NULL DEFAULT 0,
      "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "employee_overtime_pkey" PRIMARY KEY ("id")
    )`,
  ];

  for (const sql of tables) {
    await prisma.$executeRawUnsafe(sql);
  }

  const fks = [
    ['employee_allowance', 'employeeId', 'employee'],
    ['employee_allowance', 'allowanceOptionId', 'allowance_option'],
    ['employee_commission', 'employeeId', 'employee'],
    ['employee_loan', 'employeeId', 'employee'],
    ['employee_loan', 'loanOptionId', 'loan_option'],
    ['employee_saturation_deduction', 'employeeId', 'employee'],
    ['employee_saturation_deduction', 'deductionOptionId', 'deduction_option'],
    ['employee_other_payment', 'employeeId', 'employee'],
    ['employee_overtime', 'employeeId', 'employee'],
  ];

  for (const [table, col, ref] of fks) {
    const fkName = `${table}_${col}_fkey`;
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "${table}" ADD CONSTRAINT "${fkName}"
        FOREIGN KEY ("${col}") REFERENCES "${ref}"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch {
      // Constraint may already exist
    }
  }

  console.log("Employee payroll tables ready.");
}
