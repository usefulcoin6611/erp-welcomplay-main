-- CreateTable
CREATE TABLE "warehouse_transfer" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "fromWarehouseId" TEXT NOT NULL,
    "toWarehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "branchId" TEXT,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_transfer_transferId_key" ON "warehouse_transfer"("transferId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_branchId_idx" ON "warehouse_transfer"("branchId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_fromWarehouseId_idx" ON "warehouse_transfer"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_toWarehouseId_idx" ON "warehouse_transfer"("toWarehouseId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_productId_idx" ON "warehouse_transfer"("productId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_transferDate_idx" ON "warehouse_transfer"("transferDate");

-- AddForeignKey
ALTER TABLE "warehouse_transfer" ADD CONSTRAINT "warehouse_transfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer" ADD CONSTRAINT "warehouse_transfer_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer" ADD CONSTRAINT "warehouse_transfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer" ADD CONSTRAINT "warehouse_transfer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
