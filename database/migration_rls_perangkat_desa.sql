/**
 * database/migration_rls_perangkat_desa.sql
 *
 * ============================================================
 * PERBAIKAN ROW LEVEL SECURITY — Tabel perangkat_desa
 * ============================================================
 *
 * ANALISIS MASALAH:
 * -----------------
 * Project ini menggunakan:
 *   - supabaseAdmin (SERVICE_ROLE_KEY) untuk semua operasi CRUD admin
 *   - supabaseAnon  (ANON_KEY)         untuk query publik (SELECT)
 *
 * Service role key SEHARUSNYA bypass RLS secara otomatis.
 * Namun jika Supabase client dibuat dengan opsi tertentu,
 * atau jika RLS dikonfigurasi dengan FORCE, service_role bisa
 * terkena RLS juga.
 *
 * SOLUSI AMAN:
 * ------------
 * 1. Pastikan service_role SELALU bypass RLS (default Supabase behavior)
 * 2. Tambahkan policy eksplisit untuk anon/authenticated sesuai kebutuhan
 * 3. TIDAK menonaktifkan RLS
 * 4. TIDAK memberi akses INSERT/UPDATE/DELETE ke anon
 *
 * CARA MENJALANKAN:
 * -----------------
 * Supabase Dashboard → SQL Editor → New Query → Paste & Run
 * ============================================================
 */


-- ============================================================
-- LANGKAH 1: Hapus semua policy lama yang mungkin konflik
-- ============================================================
-- (Aman dijalankan meski policy belum ada — IF EXISTS mencegah error)

DROP POLICY IF EXISTS "perangkat_desa_select_public"  ON perangkat_desa;
DROP POLICY IF EXISTS "perangkat_desa_insert_admin"   ON perangkat_desa;
DROP POLICY IF EXISTS "perangkat_desa_update_admin"   ON perangkat_desa;
DROP POLICY IF EXISTS "perangkat_desa_delete_admin"   ON perangkat_desa;
DROP POLICY IF EXISTS "Allow public select"            ON perangkat_desa;
DROP POLICY IF EXISTS "Allow service role all"         ON perangkat_desa;
DROP POLICY IF EXISTS "Enable read access for all users" ON perangkat_desa;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON perangkat_desa;
DROP POLICY IF EXISTS "Enable all for service role"    ON perangkat_desa;
-- Hapus policy lama dengan nama apapun (broad cleanup)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'perangkat_desa' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.perangkat_desa', pol.policyname);
  END LOOP;
END $$;


-- ============================================================
-- LANGKAH 2: Pastikan RLS aktif (tidak dinonaktifkan)
-- ============================================================
ALTER TABLE public.perangkat_desa ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- LANGKAH 3: Policy SELECT — Publik boleh baca data aktif
-- ============================================================
-- Halaman publik /pemerintahan menggunakan supabaseAnon (anon key)
-- untuk menampilkan perangkat aktif. Policy ini memperbolehkan SELECT.
CREATE POLICY "perangkat_select_publik"
  ON public.perangkat_desa
  FOR SELECT
  TO anon, authenticated
  USING (aktif = true);


-- ============================================================
-- LANGKAH 4: Policy SELECT untuk admin — baca semua (termasuk nonaktif)
-- ============================================================
-- supabaseAdmin menggunakan service_role yang bypass RLS secara default.
-- Policy ini sebagai fallback eksplisit jika bypass tidak bekerja.
-- Menggunakan auth.role() = 'service_role' untuk identifikasi.
CREATE POLICY "perangkat_select_admin"
  ON public.perangkat_desa
  FOR SELECT
  TO service_role
  USING (true);


-- ============================================================
-- LANGKAH 5: Policy INSERT — hanya service_role (admin backend)
-- ============================================================
CREATE POLICY "perangkat_insert_admin"
  ON public.perangkat_desa
  FOR INSERT
  TO service_role
  WITH CHECK (true);


-- ============================================================
-- LANGKAH 6: Policy UPDATE — hanya service_role (admin backend)
-- ============================================================
CREATE POLICY "perangkat_update_admin"
  ON public.perangkat_desa
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- LANGKAH 7: Policy DELETE — hanya service_role (admin backend)
-- ============================================================
CREATE POLICY "perangkat_delete_admin"
  ON public.perangkat_desa
  FOR DELETE
  TO service_role
  USING (true);


-- ============================================================
-- VERIFIKASI: Lihat semua policy yang aktif
-- ============================================================
SELECT
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'perangkat_desa'
  AND schemaname = 'public'
ORDER BY cmd, policyname;
