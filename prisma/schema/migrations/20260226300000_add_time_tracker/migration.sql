-- CreateTable
CREATE TABLE IF NOT EXISTS "time_tracker" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "totalSeconds" INTEGER NOT NULL DEFAULT 0,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_tracker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "time_tracker" ADD CONSTRAINT "time_tracker_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_tracker" ADD CONSTRAINT "time_tracker_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "project_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
