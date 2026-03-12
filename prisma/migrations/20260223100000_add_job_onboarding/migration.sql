-- CreateTable
CREATE TABLE "job_onboarding" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "onboardingDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_onboarding_applicationId_key" ON "job_onboarding"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "job_onboarding_employeeId_key" ON "job_onboarding"("employeeId");

-- AddForeignKey
ALTER TABLE "job_onboarding" ADD CONSTRAINT "job_onboarding_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_onboarding" ADD CONSTRAINT "job_onboarding_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
