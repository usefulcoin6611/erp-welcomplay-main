/*
  Warnings:

  - A unique constraint covering the columns `[key,userId]` on the table `setting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "setting_key_key";

-- AlterTable
ALTER TABLE "setting" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "setting_key_userId_key" ON "setting"("key", "userId");

-- AddForeignKey
ALTER TABLE "setting" ADD CONSTRAINT "setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
