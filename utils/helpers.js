/**
 * utils/helpers.js — Fungsi Utilitas Umum
 *
 * Kumpulan fungsi pembantu yang digunakan di berbagai bagian aplikasi.
 */

"use strict";

/**
 * Format tanggal ke format Indonesia.
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string} Tanggal dalam format "15 Agustus 2024"
 */
function formatTanggal(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Potong teks panjang menjadi ringkasan (excerpt).
 * @param {string} text - Teks yang akan dipotong
 * @param {number} maxLength - Panjang maksimal (default: 150)
 * @returns {string} Teks yang sudah dipotong dengan "..."
 */
function createExcerpt(text, maxLength = 150) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Ubah teks menjadi slug URL-friendly.
 * Contoh: "Berita Desa Terbaru" → "berita-desa-terbaru"
 * @param {string} text
 * @returns {string}
 */
function createSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

module.exports = { formatTanggal, createExcerpt, createSlug };
