/*
  Warnings:

  - A unique constraint covering the columns `[branchId,name]` on the table `contract_type` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branchId,code]` on the table `form_builder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branch,department,designation,periodYear,periodQuarter,ownerId]` on the table `performance_indicator` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "contract_type_name_key";

-- DropIndex
DROP INDEX "form_builder_code_key";

-- DropIndex
DROP INDEX "performance_indicator_period_key";

-- AlterTable
ALTER TABLE "bug_status" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "contract_type" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "estimate" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "form_builder" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "hrm_announcement" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "hrm_event" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "hrm_holiday" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "hrm_meeting" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "performance_goal" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "performance_indicator" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "project_task_stage" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "tax" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "trainer" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "unit" ADD COLUMN     "branchId" TEXT;

-- CreateIndex
CREATE INDEX "bug_status_branchId_idx" ON "bug_status"("branchId");

-- CreateIndex
CREATE INDEX "contract_branchId_idx" ON "contract"("branchId");

-- CreateIndex
CREATE INDEX "contract_type_branchId_idx" ON "contract_type"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_type_branchId_name_key" ON "contract_type"("branchId", "name");

-- CreateIndex
CREATE INDEX "estimate_branchId_idx" ON "estimate"("branchId");

-- CreateIndex
CREATE INDEX "form_builder_branchId_idx" ON "form_builder"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "form_builder_branchId_code_key" ON "form_builder"("branchId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "performance_indicator_period_key" ON "performance_indicator"("branch", "department", "designation", "periodYear", "periodQuarter", "ownerId");

-- CreateIndex
CREATE INDEX "project_branchId_idx" ON "project"("branchId");

-- CreateIndex
CREATE INDEX "project_task_stage_branchId_idx" ON "project_task_stage"("branchId");

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_type" ADD CONSTRAINT "contract_type_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_builder" ADD CONSTRAINT "form_builder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax" ADD CONSTRAINT "tax_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit" ADD CONSTRAINT "unit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task_stage" ADD CONSTRAINT "project_task_stage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_status" ADD CONSTRAINT "bug_status_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
