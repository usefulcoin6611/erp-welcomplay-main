-- Ensure base project table exists for foreign key references.
-- In the live database this table is created by an earlier migration;
-- here we recreate the minimal structure for the shadow database.
CREATE TABLE IF NOT EXISTS "project" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedHrs" DOUBLE PRECISION DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "tags" TEXT,
    "users" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_projectId_key" ON "project"("projectId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_task" (
    "id" TEXT NOT NULL,
    "taskKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "estimatedHrs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attachments" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "checklists" INTEGER NOT NULL DEFAULT 0,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "project_task_taskKey_key" ON "project_task"("taskKey");

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
