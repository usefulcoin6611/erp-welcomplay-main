-- Ensure bug_status table exists for foreign key reference from bug.statusId.
-- In the live database this table is created by an earlier migration;
-- here we recreate the minimal structure for the shadow database.
CREATE TABLE IF NOT EXISTS "bug_status" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bug" (
    "id" TEXT NOT NULL,
    "bugKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "description" TEXT,
    "statusId" TEXT,
    "createdBy" TEXT,
    "assignedTo" JSONB DEFAULT '[]',
    "attachments" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bug_bugKey_key" ON "bug"("bugKey");

-- AddForeignKey
ALTER TABLE "bug" ADD CONSTRAINT "bug_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug" ADD CONSTRAINT "bug_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "bug_status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
