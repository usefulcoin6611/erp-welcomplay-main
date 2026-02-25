-- Add optional period fields to performance_indicator for reporting by year/quarter
ALTER TABLE "performance_indicator"
ADD COLUMN IF NOT EXISTS "periodYear" INTEGER,
ADD COLUMN IF NOT EXISTS "periodQuarter" INTEGER;

