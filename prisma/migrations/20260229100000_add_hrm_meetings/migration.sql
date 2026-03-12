-- CreateTable
CREATE TABLE "hrm_meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "meetingTime" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrm_meeting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hrm_meeting_employeeId_idx" ON "hrm_meeting"("employeeId");
CREATE INDEX "hrm_meeting_meetingDate_idx" ON "hrm_meeting"("meetingDate");

ALTER TABLE "hrm_meeting" ADD CONSTRAINT "hrm_meeting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
