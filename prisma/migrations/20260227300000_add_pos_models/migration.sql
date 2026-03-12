-- CreateTable
CREATE TABLE "warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "branchId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_order" (
    "id" TEXT NOT NULL,
    "posId" TEXT NOT NULL,
    "customerId" TEXT,
    "warehouseId" TEXT,
    "branchId" TEXT,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "quotationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_order_item" (
    "id" TEXT NOT NULL,
    "posOrderId" TEXT NOT NULL,
    "productId" TEXT,
    "itemName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode_setting" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "barcodeType" TEXT NOT NULL DEFAULT 'code128',
    "barcodeFormat" TEXT NOT NULL DEFAULT 'css',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barcode_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pos_order_posId_key" ON "pos_order"("posId");

-- CreateIndex
CREATE INDEX "warehouse_branchId_idx" ON "warehouse"("branchId");

-- CreateIndex
CREATE INDEX "pos_order_branchId_idx" ON "pos_order"("branchId");

-- CreateIndex
CREATE INDEX "pos_order_customerId_idx" ON "pos_order"("customerId");

-- CreateIndex
CREATE INDEX "pos_order_warehouseId_idx" ON "pos_order"("warehouseId");

-- CreateIndex
CREATE INDEX "pos_order_createdAt_idx" ON "pos_order"("createdAt");

-- CreateIndex
CREATE INDEX "pos_order_item_posOrderId_idx" ON "pos_order_item"("posOrderId");

-- CreateIndex
CREATE INDEX "barcode_setting_branchId_idx" ON "barcode_setting"("branchId");

-- AddForeignKey
ALTER TABLE "warehouse" ADD CONSTRAINT "warehouse_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_order" ADD CONSTRAINT "pos_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_order" ADD CONSTRAINT "pos_order_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_order" ADD CONSTRAINT "pos_order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_order_item" ADD CONSTRAINT "pos_order_item_posOrderId_fkey" FOREIGN KEY ("posOrderId") REFERENCES "pos_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_order_item" ADD CONSTRAINT "pos_order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcode_setting" ADD CONSTRAINT "barcode_setting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
