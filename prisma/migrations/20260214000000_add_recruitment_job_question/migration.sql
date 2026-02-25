-- CreateTable
CREATE TABLE "recruitment_question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "jobCategoryId" TEXT NOT NULL,
    "positions" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "requirement" TEXT,
    "skill" JSONB,
    "applicant" JSONB,
    "visibility" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_question" (
    "jobId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_question_pkey" PRIMARY KEY ("jobId","questionId")
);

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "job_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_question" ADD CONSTRAINT "job_question_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_question" ADD CONSTRAINT "job_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "recruitment_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
