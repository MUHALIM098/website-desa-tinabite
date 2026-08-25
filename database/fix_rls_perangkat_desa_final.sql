/**
 * database/fix_rls_perangkat_desa_final.sql
 *
 * ============================================================
 * FIX FINAL: RLS "new row violates row-level security policy"
 * ============================================================
 *
 * PENYEBAB:
 *   Tabel perangkat_desa dikonfigurasi dengan FORCE ROW LEVEL SECURITY.
 *   Saat FORCE aktif, PostgreSQL memaksa RLS bahkan untuk role yang
 *   seharusnya bypass (termasuk service_role yang digunakan supabaseAdmin).
 *
 * SOLUSI:
 *   - Nonaktifkan FORCE RLS  → service_role kembali bypass RLS
 *   - RLS tetap AKTIF         → anon masih diproteksi oleh policy
 *   - Buat policy lengkap     → SELECT publik + full access service_role
 *
 * CARA MENJALANKAN:
 *   Supabase Dashboard → SQL Editor → New Query → Paste semua → Run
 * ============================================================
 */

-- ============================================================
-- STEP 1: Nonaktifkan FORCE RLS — ini penyebab utama error
-- (bukan menonaktifkan RLS, hanya menghapus FORCE)
-- ============================================================
ALTER TABLE public.perangkat_desa NO FORCE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Pastikan RLS tetap AKTIF (proteksi untuk anon)
-- ============================================================
ALTER TABLE public.perangkat_desa ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Bersihkan semua policy lama yang mungkin konflik
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'perangkat_desa' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.perangkat_desa', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- ============================================================
-- STEP 4: Policy SELECT untuk publik (anon) — hanya aktif = true
-- Digunakan oleh halaman /pemerintahan
-- ============================================================
CREATE POLICY "perangkat_select_publik"
  ON public.perangkat_desa
  FOR SELECT
  TO anon, authenticated
  USING (aktif = true);

-- ============================================================
-- STEP 5: Policy lengkap untuk service_role (backend admin)
-- service_role sudah bypass RLS setelah NO FORCE,
-- policy ini sebagai fallback eksplisit
-- ============================================================
CREATE POLICY "perangkat_select_admin"
  ON public.perangkat_desa
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "perangkat_insert_admin"
  ON public.perangkat_desa
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "perangkat_update_admin"
  ON public.perangkat_desa
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "perangkat_delete_admin"
  ON public.perangkat_desa
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================
-- VERIFIKASI: Cek status RLS dan daftar policy
-- ============================================================
SELECT
  c.relname                              AS "tabel",
  c.relrowsecurity                       AS "rls_aktif",
  c.relforcerowsecurity                  AS "force_rls"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'perangkat_desa' AND n.nspname = 'public';

SELECT
  policyname  AS "nama_policy",
  roles       AS "role",
  cmd         AS "operasi",
  qual        AS "kondisi_using",
  with_check  AS "kondisi_with_check"
FROM pg_policies
WHERE tablename = 'perangkat_desa' AND schemaname = 'public'
ORDER BY cmd, policyname;
