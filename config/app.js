/**
 * config/app.js — Konstanta dan konfigurasi umum aplikasi
 *
 * Simpan nilai-nilai konfigurasi yang digunakan di berbagai tempat
 * dalam satu file agar mudah diubah.
 */

"use strict";

const appConfig = {
  // Informasi Aplikasi
  name: process.env.APP_NAME || "Website Desa Tinabite",
  url: process.env.APP_URL || "http://localhost:3000",
  env: process.env.NODE_ENV || "development",

  // Informasi Desa (untuk digunakan di template)
  desa: {
    nama: "Desa Tinabite",
    kecamatan: "Lantari Jaya",
    kabupaten: "Bombana",
    provinsi: "Sulawesi Tenggara",
    kodePos: null, // Isi jika sudah diketahui
    email: null,   // Isi jika sudah ada email desa
    telepon: null, // Isi jika sudah ada nomor telepon desa
  },

  // Konfigurasi Supabase Storage
  storage: {
    bucketName: process.env.SUPABASE_STORAGE_BUCKET || "desa-tinabite-media",
    // Subfolder dalam bucket untuk mengorganisir file
    folders: {
      berita: "berita",
      beritaVideo: "berita-video",
      galeri: "galeri",
      potensi: "potensi",
      profil: "profil",
      perangkat: "perangkat",
    },
  },

  // Pagination default
  pagination: {
    itemsPerPage: 10,
  },
};

module.exports = appConfig;
