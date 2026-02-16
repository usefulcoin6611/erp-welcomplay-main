-- CreateTable
CREATE TABLE "bank_transfer" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reference" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_transfer" ADD CONSTRAINT "bank_transfer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transfer" ADD CONSTRAINT "bank_transfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "bank_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transfer" ADD CONSTRAINT "bank_transfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "bank_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
