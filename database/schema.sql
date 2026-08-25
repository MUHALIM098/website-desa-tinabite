/**
 * database/schema.sql — Referensi Schema Database Supabase
 *
 * File ini adalah REFERENSI SAJA — tidak dijalankan otomatis.
 * Jalankan SQL ini di Supabase SQL Editor:
 * https://supabase.com/dashboard → Project → SQL Editor
 *
 * CATATAN: Schema ini adalah rancangan awal dan akan berkembang
 * sesuai kebutuhan di tahap-tahap berikutnya.
 */

-- ============================================================
-- AKTIFKAN EXTENSION UUID (jika belum aktif)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFIL DESA
-- Menyimpan informasi umum tentang Desa Tinabite
-- ============================================================
CREATE TABLE IF NOT EXISTS profil_desa (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kunci       VARCHAR(100) UNIQUE NOT NULL, -- identifier unik (contoh: 'sejarah', 'visi', 'misi')
    judul       VARCHAR(255),
    konten      TEXT,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STATISTIK DESA
-- Menyimpan data statistik seperti jumlah penduduk, KK, dll.
-- ============================================================
CREATE TABLE IF NOT EXISTS statistik_desa (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori    VARCHAR(100) NOT NULL, -- contoh: 'penduduk', 'kk', 'luas_wilayah'
    label       VARCHAR(255) NOT NULL,
    nilai       VARCHAR(100),
    satuan      VARCHAR(50),           -- contoh: 'jiwa', 'KK', 'km²'
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PERANGKAT DESA
-- Menyimpan data kepala desa dan perangkat desa
-- ============================================================
CREATE TABLE IF NOT EXISTS perangkat_desa (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama        VARCHAR(255) NOT NULL,
    jabatan     VARCHAR(255) NOT NULL,
    foto_url    TEXT,
    foto_path   TEXT,                    -- path di Supabase Storage (untuk hapus/ganti)
    urutan      INTEGER DEFAULT 0,       -- untuk mengatur urutan tampilan
    aktif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- BERITA & PENGUMUMAN
-- ============================================================
CREATE TABLE IF NOT EXISTS berita (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul       VARCHAR(500) NOT NULL,
    slug        VARCHAR(500) UNIQUE NOT NULL,
    ringkasan   TEXT,
    konten      TEXT,
    foto_url    TEXT,
    foto_path   TEXT,        -- path di Supabase Storage (untuk hapus/ganti)
    video_url   TEXT,        -- URL video (dari Supabase Storage)
    video_path  TEXT,        -- path video di Supabase Storage
    kategori    VARCHAR(100) DEFAULT 'berita', -- 'berita' atau 'pengumuman'
    published   BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- UMKM
-- ============================================================
CREATE TABLE IF NOT EXISTS umkm (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_usaha  VARCHAR(255) NOT NULL,
    pemilik     VARCHAR(255),
    kategori    VARCHAR(100),
    deskripsi   TEXT,
    foto_url    TEXT,
    kontak      VARCHAR(100),
    aktif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- POTENSI DESA
-- ============================================================
CREATE TABLE IF NOT EXISTS potensi_desa (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul       VARCHAR(255) NOT NULL,
    kategori    VARCHAR(100),          -- contoh: 'pertanian', 'pariwisata', 'peternakan'
    deskripsi   TEXT,
    foto_url    TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GALERI
-- ============================================================
CREATE TABLE IF NOT EXISTS galeri (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul       VARCHAR(255),
    foto_url    TEXT NOT NULL,
    kategori    VARCHAR(100),
    urutan      INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PESAN KONTAK
-- ============================================================
CREATE TABLE IF NOT EXISTS pesan_kontak (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama        VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    subjek      VARCHAR(500),
    pesan       TEXT NOT NULL,
    sudah_dibaca BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SARANA DAN PRASARANA
-- Dikelompokkan per kategori: Kesehatan | Pendidikan | Ibadah | Umum
-- Dibaca oleh halaman publik /profil via supabaseAnon (perlu RLS SELECT anon)
-- ============================================================
CREATE TABLE IF NOT EXISTS sarana_prasarana (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori    VARCHAR(50) NOT NULL,   -- 'Kesehatan' | 'Pendidikan' | 'Ibadah' | 'Umum'
    nama        VARCHAR(255) NOT NULL,
    jumlah      VARCHAR(50) DEFAULT '0',
    satuan      VARCHAR(50) DEFAULT 'unit',
    urutan      INTEGER DEFAULT 0,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
