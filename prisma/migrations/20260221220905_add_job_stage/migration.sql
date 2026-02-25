-- CreateTable
CREATE TABLE "job_stage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_application"
ADD CONSTRAINT "job_application_stageId_fkey"
FOREIGN KEY ("stageId") REFERENCES "job_stage"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
