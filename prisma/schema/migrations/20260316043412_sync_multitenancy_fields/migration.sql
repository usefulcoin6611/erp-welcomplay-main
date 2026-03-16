-- AlterTable
ALTER TABLE "allowance_option" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "award_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "competency" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "deduction_option" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "document_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "goal_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "hrm_assets" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "job_category" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "job_stage" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "leave_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "loan_option" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "payslip_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "performance_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "termination_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "training_type" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "pendingPlan" TEXT;
