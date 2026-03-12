/*
  Warnings:

  - You are about to drop the column `branchId` on the `credit_note` table. All the data in the column will be lost.
  - You are about to drop the column `creditNoteNumber` on the `credit_note` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `refNumber` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `invoice_item` table. All the data in the column will be lost.
  - You are about to drop the `bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bill_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proposal_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `revenue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceId]` on the table `invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `credit_note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemName` to the `invoice_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bill" DROP CONSTRAINT "bill_branchId_fkey";

-- DropForeignKey
ALTER TABLE "bill" DROP CONSTRAINT "bill_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "bill_item" DROP CONSTRAINT "bill_item_accountId_fkey";

-- DropForeignKey
ALTER TABLE "bill_item" DROP CONSTRAINT "bill_item_billId_fkey";

-- DropForeignKey
ALTER TABLE "credit_note" DROP CONSTRAINT "credit_note_branchId_fkey";

-- DropForeignKey
ALTER TABLE "credit_note" DROP CONSTRAINT "credit_note_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_branchId_fkey";

-- DropForeignKey
ALTER TABLE "invoice_item" DROP CONSTRAINT "invoice_item_accountId_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_branchId_fkey";

-- DropForeignKey
ALTER TABLE "proposal" DROP CONSTRAINT "proposal_customerId_fkey";

-- DropForeignKey
ALTER TABLE "proposal_item" DROP CONSTRAINT "proposal_item_accountId_fkey";

-- DropForeignKey
ALTER TABLE "proposal_item" DROP CONSTRAINT "proposal_item_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "revenue" DROP CONSTRAINT "revenue_accountId_fkey";

-- DropForeignKey
ALTER TABLE "revenue" DROP CONSTRAINT "revenue_branchId_fkey";

-- DropForeignKey
ALTER TABLE "revenue" DROP CONSTRAINT "revenue_customerId_fkey";

-- DropForeignKey
ALTER TABLE "supplier" DROP CONSTRAINT "supplier_branchId_fkey";

-- DropIndex
DROP INDEX "credit_note_creditNoteNumber_key";

-- DropIndex
DROP INDEX "invoice_invoiceNumber_key";

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "color" TEXT DEFAULT 'FFFFFF';

-- AlterTable
ALTER TABLE "credit_note" DROP COLUMN "branchId",
DROP COLUMN "creditNoteNumber",
ADD COLUMN     "number" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "contact" DROP NOT NULL;

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "branchId",
DROP COLUMN "invoiceNumber",
DROP COLUMN "refNumber",
DROP COLUMN "totalAmount",
ADD COLUMN     "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "invoiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invoice_item" DROP COLUMN "accountId",
ADD COLUMN     "itemName" TEXT NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "journal_entry" ADD COLUMN     "customerId" TEXT;

-- DropTable
DROP TABLE "bill";

-- DropTable
DROP TABLE "bill_item";

-- DropTable
DROP TABLE "proposal";

-- DropTable
DROP TABLE "proposal_item";

-- DropTable
DROP TABLE "revenue";

-- DropTable
DROP TABLE "supplier";

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxId" TEXT,
    "categoryId" TEXT,
    "unitId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "branchId" TEXT,
    "saleAccountId" TEXT,
    "expenseAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_item" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "estimate_estimateId_key" ON "estimate"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceId_key" ON "invoice"("invoiceId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_saleAccountId_fkey" FOREIGN KEY ("saleAccountId") REFERENCES "chart_of_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_expenseAccountId_fkey" FOREIGN KEY ("expenseAccountId") REFERENCES "chart_of_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_item" ADD CONSTRAINT "estimate_item_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("invoiceId") ON DELETE RESTRICT ON UPDATE CASCADE;
