/**
 * database/migration_potensi_desa_columns.sql
 *
 * Migration: Tambah kolom foto_path dan urutan ke tabel potensi_desa
 *
 * Jalankan di Supabase SQL Editor:
 * https://supabase.com/dashboard → Project → SQL Editor
 *
 * Setelah migration berhasil:
 *   1. Buka models/potensiModel.js
 *   2. Hapus fungsi sanitizePayload()
 *   3. Ganti sanitizePayload(payload) dengan payload langsung pada createPotensi dan updatePotensi
 *   4. Update SELECT di getAllPotensi dan getAllPotensiAdmin untuk menyertakan foto_path dan urutan
 */

-- Tambah kolom foto_path (untuk tracking file Storage agar bisa dihapus saat diganti)
ALTER TABLE public.potensi_desa
  ADD COLUMN IF NOT EXISTS foto_path TEXT;

-- Tambah kolom urutan (untuk mengatur urutan tampil di halaman publik)
ALTER TABLE public.potensi_desa
  ADD COLUMN IF NOT EXISTS urutan INTEGER DEFAULT 0;

-- Verifikasi
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'potensi_desa'
  AND table_schema = 'public'
ORDER BY ordinal_position;
