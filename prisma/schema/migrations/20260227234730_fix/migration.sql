-- AlterTable
ALTER TABLE "access_profile" RENAME CONSTRAINT "role_pkey" TO "access_profile_pkey";

-- CreateTable
CREATE TABLE "leave_request" (
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
);

-- CreateTable
CREATE TABLE "trainer" (
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

    CONSTRAINT "trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training" (
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
);

-- CreateTable
CREATE TABLE "employee_allowance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "allowanceOptionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'Fixed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_allowance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_commission" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'Fixed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_loan" (
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
);

-- CreateTable
CREATE TABLE "employee_saturation_deduction" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deductionOptionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'Fixed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_saturation_deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_other_payment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'Fixed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_other_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_overtime" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 0,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_overtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" SERIAL NOT NULL,
    "branch" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "attachment" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_uploads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_request_employeeId_idx" ON "leave_request"("employeeId");

-- CreateIndex
CREATE INDEX "leave_request_leaveTypeId_idx" ON "leave_request"("leaveTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_email_key" ON "trainer"("email");

-- CreateIndex
CREATE INDEX "training_trainingTypeId_idx" ON "training"("trainingTypeId");

-- CreateIndex
CREATE INDEX "training_employeeId_idx" ON "training"("employeeId");

-- CreateIndex
CREATE INDEX "training_trainerId_idx" ON "training"("trainerId");

-- CreateIndex
CREATE INDEX "employee_allowance_employeeId_idx" ON "employee_allowance"("employeeId");

-- CreateIndex
CREATE INDEX "employee_commission_employeeId_idx" ON "employee_commission"("employeeId");

-- CreateIndex
CREATE INDEX "employee_loan_employeeId_idx" ON "employee_loan"("employeeId");

-- CreateIndex
CREATE INDEX "employee_saturation_deduction_employeeId_idx" ON "employee_saturation_deduction"("employeeId");

-- CreateIndex
CREATE INDEX "employee_other_payment_employeeId_idx" ON "employee_other_payment"("employeeId");

-- CreateIndex
CREATE INDEX "employee_overtime_employeeId_idx" ON "employee_overtime"("employeeId");

-- RenameForeignKey
ALTER TABLE "access_profile" RENAME CONSTRAINT "role_branchId_fkey" TO "access_profile_branchId_fkey";

-- AddForeignKey
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training" ADD CONSTRAINT "training_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training" ADD CONSTRAINT "training_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training" ADD CONSTRAINT "training_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_allowance" ADD CONSTRAINT "employee_allowance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_allowance" ADD CONSTRAINT "employee_allowance_allowanceOptionId_fkey" FOREIGN KEY ("allowanceOptionId") REFERENCES "allowance_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_commission" ADD CONSTRAINT "employee_commission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_loan" ADD CONSTRAINT "employee_loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_loan" ADD CONSTRAINT "employee_loan_loanOptionId_fkey" FOREIGN KEY ("loanOptionId") REFERENCES "loan_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_saturation_deduction" ADD CONSTRAINT "employee_saturation_deduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_saturation_deduction" ADD CONSTRAINT "employee_saturation_deduction_deductionOptionId_fkey" FOREIGN KEY ("deductionOptionId") REFERENCES "deduction_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_other_payment" ADD CONSTRAINT "employee_other_payment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_overtime" ADD CONSTRAINT "employee_overtime_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
