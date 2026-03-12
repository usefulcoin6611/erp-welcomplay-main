-- AlterTable
ALTER TABLE "category" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "chart_of_account" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "journal_entry" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_account" ADD CONSTRAINT "chart_of_account_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
