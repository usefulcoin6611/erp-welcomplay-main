-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" TEXT NOT NULL DEFAULT 'month',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxCustomers" INTEGER NOT NULL DEFAULT 5,
    "maxVenders" INTEGER NOT NULL DEFAULT 5,
    "maxClients" INTEGER NOT NULL DEFAULT 5,
    "storageLimit" INTEGER NOT NULL DEFAULT 1024,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "isDisable" BOOLEAN NOT NULL DEFAULT false,
    "hasAccount" BOOLEAN NOT NULL DEFAULT true,
    "hasCrm" BOOLEAN NOT NULL DEFAULT true,
    "hasHrm" BOOLEAN NOT NULL DEFAULT true,
    "hasProject" BOOLEAN NOT NULL DEFAULT false,
    "hasPos" BOOLEAN NOT NULL DEFAULT false,
    "hasChatgpt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");
