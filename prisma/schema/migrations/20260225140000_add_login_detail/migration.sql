-- CreateTable
CREATE TABLE "login_detail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_detail_userId_idx" ON "login_detail"("userId");

-- CreateIndex
CREATE INDEX "login_detail_date_idx" ON "login_detail"("date");

-- AddForeignKey
ALTER TABLE "login_detail" ADD CONSTRAINT "login_detail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
