/**
 * Ensures trainer and training tables exist. Safe to run multiple times.
 * Use when migrations have drift and these tables are missing.
 */
export async function ensureTrainingSchema(prisma: any) {
  console.log("Ensuring trainer and training tables...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "trainer" (
      "id" TEXT NOT NULL,
      "branch" TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "contact" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "expertise" TEXT,
      "address" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "trainer_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "trainer_email_key" UNIQUE ("email")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "training" (
      "id" TEXT NOT NULL,
      "branch" TEXT NOT NULL,
      "trainerOption" TEXT NOT NULL,
      "trainingTypeId" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "trainerId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Pending',
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "description" TEXT,
      "performance" TEXT,
      "remarks" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "training_pkey" PRIMARY KEY ("id")
    )
  `);

  const fkStatements = [
    {
      name: "training_trainingTypeId_fkey",
      sql: `ALTER TABLE "training" ADD CONSTRAINT "training_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    },
    {
      name: "training_employeeId_fkey",
      sql: `ALTER TABLE "training" ADD CONSTRAINT "training_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    },
    {
      name: "training_trainerId_fkey",
      sql: `ALTER TABLE "training" ADD CONSTRAINT "training_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    },
  ];

  for (const { sql } of fkStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Constraint may already exist
    }
  }

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "training_trainingTypeId_idx" ON "training"("trainingTypeId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "training_employeeId_idx" ON "training"("employeeId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "training_trainerId_idx" ON "training"("trainerId")
  `);

  console.log("trainer and training tables ready.");
}
