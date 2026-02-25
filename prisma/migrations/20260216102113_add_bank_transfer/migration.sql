-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "chartAccountId" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contactNumber" TEXT,
    "bankAddress" TEXT,
    "paymentGateway" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_chartAccountId_fkey" FOREIGN KEY ("chartAccountId") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
