/**
 * database/migration_profil_perangkat.sql
 *
 * Migration: Tambah kolom profil ke tabel perangkat_desa
 *
 * Kolom yang ditambahkan:
 *   - motto         : motto/semboyan perangkat
 *   - profil        : profil singkat
 *   - pendidikan    : riwayat pendidikan
 *   - pengalaman    : riwayat jabatan/pengalaman
 *
 * Kolom foto_path juga ditambahkan jika belum ada
 * (sudah ada di migration_perangkat_foto_path.sql, ini sebagai safety net).
 *
 * Cara menjalankan:
 *   Supabase Dashboard → SQL Editor → New Query → Paste & Run
 *
 * AMAN: Menggunakan ADD COLUMN IF NOT EXISTS — tidak menghapus data existing.
 */

-- Kolom foto_path (safety net, mungkin sudah ada)
ALTER TABLE public.perangkat_desa
  ADD COLUMN IF NOT EXISTS foto_path TEXT;

-- Kolom profil perangkat
ALTER TABLE public.perangkat_desa
  ADD COLUMN IF NOT EXISTS motto TEXT;

ALTER TABLE public.perangkat_desa
  ADD COLUMN IF NOT EXISTS profil TEXT;

ALTER TABLE public.perangkat_desa
  ADD COLUMN IF NOT EXISTS pendidikan TEXT;

ALTER TABLE public.perangkat_desa
  ADD COLUMN IF NOT EXISTS pengalaman TEXT;

-- Verifikasi kolom setelah migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'perangkat_desa'
  AND table_schema = 'public'
ORDER BY ordinal_position;
