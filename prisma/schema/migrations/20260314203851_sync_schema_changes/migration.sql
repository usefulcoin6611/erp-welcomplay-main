-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "paymentDetails" JSONB;

-- CreateTable
CREATE TABLE "hrm_asset_employees" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "employee_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hrm_asset_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hrm_assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_date" DATE,
    "supported_date" DATE,
    "amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hrm_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hrm_asset_employees_asset_id_employee_id_key" ON "hrm_asset_employees"("asset_id", "employee_id");

-- AddForeignKey
ALTER TABLE "hrm_asset_employees" ADD CONSTRAINT "hrm_asset_employees_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "hrm_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hrm_asset_employees" ADD CONSTRAINT "hrm_asset_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
