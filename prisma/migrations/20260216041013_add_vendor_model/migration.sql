-- CreateTable
CREATE TABLE "vendor" (
    "id" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taxNumber" TEXT,
    "billingName" TEXT,
    "billingCountry" TEXT,
    "billingState" TEXT,
    "billingCity" TEXT,
    "billingPhone" TEXT,
    "billingZip" TEXT,
    "billingAddress" TEXT,
    "shippingName" TEXT,
    "shippingCountry" TEXT,
    "shippingState" TEXT,
    "shippingCity" TEXT,
    "shippingPhone" TEXT,
    "shippingZip" TEXT,
    "shippingAddress" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "reference" TEXT,
    "description" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "reference" TEXT,
    "description" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_vendorCode_key" ON "vendor"("vendorCode");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_email_key" ON "vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "expense_expenseId_key" ON "expense"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_paymentId_key" ON "payment"("paymentId");

-- AddForeignKey
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
