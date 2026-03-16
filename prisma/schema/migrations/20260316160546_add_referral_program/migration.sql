-- CreateTable
CREATE TABLE "referral_transaction" (
    "id" TEXT NOT NULL,
    "referrerBranchId" TEXT NOT NULL,
    "refereeCompanyName" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planPrice" DOUBLE PRECISION NOT NULL,
    "commissionPercent" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_request" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_setting" (
    "id" TEXT NOT NULL,
    "isEnable" BOOLEAN NOT NULL DEFAULT true,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "minimumThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "guideline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_setting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "referral_transaction" ADD CONSTRAINT "referral_transaction_referrerBranchId_fkey" FOREIGN KEY ("referrerBranchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_request" ADD CONSTRAINT "payout_request_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
