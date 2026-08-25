/**
 * database/migration_perangkat_foto_path.sql
 *
 * Migration: Tambah kolom foto_path ke tabel perangkat_desa
 *
 * Jalankan di Supabase SQL Editor:
 * https://supabase.com/dashboard → Project → SQL Editor
 *
 * Kolom foto_path menyimpan path file di Supabase Storage
 * sehingga file lama bisa dihapus saat foto diganti/diupdate.
 */

-- Tambah kolom foto_path jika belum ada
ALTER TABLE perangkat_desa
  ADD COLUMN IF NOT EXISTS foto_path TEXT;

-- Verifikasi struktur tabel setelah migration
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'perangkat_desa'
-- ORDER BY ordinal_position;
