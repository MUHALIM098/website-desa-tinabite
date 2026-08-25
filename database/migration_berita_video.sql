-- ============================================================
-- MIGRATION: Tambah kolom video dan foto_path ke tabel berita
-- 
-- Jalankan SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard → Project → SQL Editor
-- ============================================================

-- Tambah kolom foto_path (jika belum ada)
ALTER TABLE berita
  ADD COLUMN IF NOT EXISTS foto_path TEXT;

-- Tambah kolom video_url (jika belum ada)
ALTER TABLE berita
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Tambah kolom video_path (jika belum ada)
ALTER TABLE berita
  ADD COLUMN IF NOT EXISTS video_path TEXT;

-- Verifikasi kolom berhasil ditambahkan
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'berita'
ORDER BY ordinal_position;
