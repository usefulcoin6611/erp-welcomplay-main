-- Ensure unique indicator per (branch, department, designation, periodYear, periodQuarter)
CREATE UNIQUE INDEX IF NOT EXISTS "performance_indicator_period_key"
ON "performance_indicator"("branch", "department", "designation", "periodYear", "periodQuarter");

