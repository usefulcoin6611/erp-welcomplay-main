-- Add startDate and endDate to holidays, migrate existing date, and enforce NOT NULL

ALTER TABLE "hrm_holiday"
  ADD COLUMN "startDate" TIMESTAMP(3),
  ADD COLUMN "endDate" TIMESTAMP(3);

-- Copy existing single date into both start and end for backwards data
UPDATE "hrm_holiday"
SET "startDate" = "date",
    "endDate" = "date"
WHERE "startDate" IS NULL
  AND "endDate" IS NULL;

-- Make new columns required
ALTER TABLE "hrm_holiday"
  ALTER COLUMN "startDate" SET NOT NULL,
  ALTER COLUMN "endDate" SET NOT NULL;

