-- CreateTable
CREATE TABLE "performance_indicator" (
    "id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "technicalRating" DOUBLE PRECISION NOT NULL,
    "organizationalRating" DOUBLE PRECISION NOT NULL,
    "customerExperienceRating" DOUBLE PRECISION NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "addedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_appraisal" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "targetRating" DOUBLE PRECISION NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "appraisalDate" TIMESTAMP(3) NOT NULL,
    "technicalRating" DOUBLE PRECISION,
    "leadershipRating" DOUBLE PRECISION,
    "teamworkRating" DOUBLE PRECISION,
    "communicationRating" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_goal" (
    "id" TEXT NOT NULL,
    "goalTypeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "targetAchievement" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_goal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "performance_appraisal" ADD CONSTRAINT "performance_appraisal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goal" ADD CONSTRAINT "performance_goal_goalTypeId_fkey" FOREIGN KEY ("goalTypeId") REFERENCES "goal_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
