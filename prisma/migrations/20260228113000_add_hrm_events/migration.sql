-- HRM events table for /hrm/events

CREATE TABLE "hrm_event" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "employeeId" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "color" TEXT NOT NULL DEFAULT 'blue',
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "hrm_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hrm_event_employeeId_idx" ON "hrm_event"("employeeId");

ALTER TABLE "hrm_event"
  ADD CONSTRAINT "hrm_event_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

