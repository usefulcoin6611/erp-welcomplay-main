-- Add optional employeeId to hrm_announcement for targeted announcements

ALTER TABLE "hrm_announcement"
  ADD COLUMN "employeeId" TEXT;

-- Index for faster lookup by employee
CREATE INDEX "hrm_announcement_employeeId_idx" ON "hrm_announcement"("employeeId");

-- Foreign key to employee, nullable and set null on delete
ALTER TABLE "hrm_announcement"
  ADD CONSTRAINT "hrm_announcement_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

