-- Hapus riwayat migrasi yang gagal agar migrate deploy bisa jalan.
-- Jalankan sekali setelah menghapus folder 20250223100000:
--   pnpm prisma db execute --file prisma/fix-failed-migration.sql
DELETE FROM "_prisma_migrations"
WHERE "migration_name" = '20250223100000_add_recruitment_job_question';
