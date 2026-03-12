/**
 * Ensures leave_request table exists. Safe to run multiple times.
 * Use when migrations have drift and leave_request is missing.
 */
export async function ensureLeaveRequestSchema(prisma: any) {
  console.log("Ensuring leave_request table...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "leave_request" (
      "id" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "leaveTypeId" TEXT NOT NULL,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "reason" TEXT,
      "status" TEXT NOT NULL DEFAULT 'Pending',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "leave_request_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "leave_request_employeeId_idx" ON "leave_request"("employeeId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "leave_request_leaveTypeId_idx" ON "leave_request"("leaveTypeId")
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "leave_request"
      ADD CONSTRAINT "leave_request_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  } catch {
    // Constraint may already exist
  }
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "leave_request"
      ADD CONSTRAINT "leave_request_leaveTypeId_fkey"
      FOREIGN KEY ("leaveTypeId") REFERENCES "leave_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  } catch {
    // Constraint may already exist
  }

  console.log("leave_request table ready.");
}
