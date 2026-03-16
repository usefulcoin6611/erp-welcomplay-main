-- CreateTable
CREATE TABLE "hrm_award" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "awardTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "gift" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_transfer" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_resignation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "noticeDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_resignation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_travel" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_travel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_promotion" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "promotionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_complaint" (
    "id" TEXT NOT NULL,
    "employeeFromId" TEXT NOT NULL,
    "complaintAgainstId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_warning" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "warningById" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "warningDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_termination" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "terminationTypeId" TEXT NOT NULL,
    "noticeDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_termination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_holiday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hrm_award_employeeId_idx" ON "hrm_award"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_award_awardTypeId_idx" ON "hrm_award"("awardTypeId");

-- CreateIndex
CREATE INDEX "hrm_transfer_employeeId_idx" ON "hrm_transfer"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_resignation_employeeId_idx" ON "hrm_resignation"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_travel_employeeId_idx" ON "hrm_travel"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_promotion_employeeId_idx" ON "hrm_promotion"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_complaint_employeeFromId_idx" ON "hrm_complaint"("employeeFromId");

-- CreateIndex
CREATE INDEX "hrm_complaint_complaintAgainstId_idx" ON "hrm_complaint"("complaintAgainstId");

-- CreateIndex
CREATE INDEX "hrm_warning_employeeId_idx" ON "hrm_warning"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_warning_warningById_idx" ON "hrm_warning"("warningById");

-- CreateIndex
CREATE INDEX "hrm_termination_employeeId_idx" ON "hrm_termination"("employeeId");

-- CreateIndex
CREATE INDEX "hrm_termination_terminationTypeId_idx" ON "hrm_termination"("terminationTypeId");

-- AddForeignKey
ALTER TABLE "hrm_award" ADD CONSTRAINT "hrm_award_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_award" ADD CONSTRAINT "hrm_award_awardTypeId_fkey" FOREIGN KEY ("awardTypeId") REFERENCES "award_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_transfer" ADD CONSTRAINT "hrm_transfer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_resignation" ADD CONSTRAINT "hrm_resignation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_travel" ADD CONSTRAINT "hrm_travel_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_promotion" ADD CONSTRAINT "hrm_promotion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_complaint" ADD CONSTRAINT "hrm_complaint_employeeFromId_fkey" FOREIGN KEY ("employeeFromId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_complaint" ADD CONSTRAINT "hrm_complaint_complaintAgainstId_fkey" FOREIGN KEY ("complaintAgainstId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_warning" ADD CONSTRAINT "hrm_warning_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_warning" ADD CONSTRAINT "hrm_warning_warningById_fkey" FOREIGN KEY ("warningById") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_termination" ADD CONSTRAINT "hrm_termination_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrm_termination" ADD CONSTRAINT "hrm_termination_terminationTypeId_fkey" FOREIGN KEY ("terminationTypeId") REFERENCES "termination_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
