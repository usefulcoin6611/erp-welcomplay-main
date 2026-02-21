/*
  Warnings:

  - You are about to drop the column `category` on the `bill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bill" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "bill_item" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "journal_entry" ADD COLUMN     "bankAccountId" TEXT,
ADD COLUMN     "paymentReceipt" TEXT;

-- CreateTable
CREATE TABLE "leave_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_item" ADD CONSTRAINT "bill_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
