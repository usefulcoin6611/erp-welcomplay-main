-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "taxNumber" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingName" TEXT,
    "billingPhone" TEXT,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingCountry" TEXT,
    "billingZip" TEXT,
    "shippingName" TEXT,
    "shippingPhone" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingCountry" TEXT,
    "shippingZip" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "taxNumber" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingName" TEXT,
    "billingPhone" TEXT,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingCountry" TEXT,
    "billingZip" TEXT,
    "shippingName" TEXT,
    "shippingPhone" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingCountry" TEXT,
    "shippingZip" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "refNumber" TEXT,
    "description" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_item" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT NOT NULL,
    "categoryId" TEXT,
    "refNumber" TEXT,
    "description" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_item" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "refNumber" TEXT,
    "description" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_item" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note" (
    "id" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "reference" TEXT,
    "description" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_customerCode_key" ON "customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_supplierCode_key" ON "supplier"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bill_billNumber_key" ON "bill"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_proposalNumber_key" ON "proposal"("proposalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "credit_note_creditNoteNumber_key" ON "credit_note"("creditNoteNumber");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill" ADD CONSTRAINT "bill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill" ADD CONSTRAINT "bill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_item" ADD CONSTRAINT "bill_item_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_item" ADD CONSTRAINT "bill_item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_item" ADD CONSTRAINT "proposal_item_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_item" ADD CONSTRAINT "proposal_item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
