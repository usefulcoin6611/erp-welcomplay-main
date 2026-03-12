-- AlterTable
ALTER TABLE "hrm_promotion" ADD COLUMN "designationId" TEXT;

-- CreateIndex
CREATE INDEX "hrm_promotion_designationId_idx" ON "hrm_promotion"("designationId");

-- AddForeignKey
ALTER TABLE "hrm_promotion" ADD CONSTRAINT "hrm_promotion_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
