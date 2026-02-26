-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "user" ADD COLUMN "customRoleId" TEXT;

-- CreateIndex
CREATE INDEX "role_branchId_idx" ON "role"("branchId");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
