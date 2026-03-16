-- Rename table role -> access_profile
ALTER TABLE "role" RENAME TO "access_profile";

-- Rename index
ALTER INDEX "role_branchId_idx" RENAME TO "access_profile_branchId_idx";

-- Rename FK constraint on user (drop and re-add to get clean name)
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_customRoleId_fkey";
ALTER TABLE "user" RENAME COLUMN "customRoleId" TO "accessProfileId";
ALTER TABLE "user" ADD CONSTRAINT "user_accessProfileId_fkey" FOREIGN KEY ("accessProfileId") REFERENCES "access_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
