/**
 * models/beritaModel.js — Query ke tabel berita
 */
"use strict";

const { supabaseAnon } = require("../config/supabase");
const { supabaseAdmin } = require("../config/supabase");

/**
 * Ambil semua berita yang sudah dipublish, diurutkan terbaru dulu
 * @param {string|null} kategori - filter 'berita' atau 'pengumuman', null = semua
 * @returns {Promise<Array>}
 */
async function getAllBerita(kategori = null) {
  if (!supabaseAnon) return [];
  let query = supabaseAnon
    .from("berita")
    .select("id, judul, slug, ringkasan, foto_url, kategori, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (kategori) query = query.eq("kategori", kategori);
  const { data, error } = await query;
  if (error) { console.error("[beritaModel] getAllBerita:", error.message); return []; }
  return data || [];
}

/**
 * Ambil satu berita berdasarkan slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
async function getBeritaBySlug(slug) {
  if (!supabaseAnon) return null;
  const { data, error } = await supabaseAnon
    .from("berita")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) { console.error("[beritaModel] getBeritaBySlug:", error.message); return null; }
  return data || null;
}

/**
 * Ambil N berita terbaru (untuk ditampilkan di beranda)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getBeritaTerbaru(limit = 3) {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("berita")
    .select("id, judul, slug, ringkasan, foto_url, kategori, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[beritaModel] getBeritaTerbaru:", error.message); return []; }
  return data || [];
}

// ============================================================
// Admin Operations (menggunakan supabaseAdmin untuk bypass RLS)
// ============================================================

/**
 * Ambil semua berita (termasuk yang belum dipublish) — untuk panel admin
 * @returns {Promise<Array>}
 */
async function getAllBeritaAdmin() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("berita")
    .select("id, judul, slug, kategori, published, published_at, foto_url, foto_path, video_url, video_path")
    .order("created_at", { ascending: false });
  if (error) { console.error("[beritaModel] getAllBeritaAdmin:", error.message); return []; }
  return data || [];
}

/**
 * Ambil satu berita by ID — untuk panel admin (edit)
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
async function getBeritaById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("berita")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[beritaModel] getBeritaById:", error.message); return null; }
  return data || null;
}

/**
 * Buat berita baru
 * @param {Object} payload
 * @returns {Promise<{data: Object}|{error: string}>}
 */
async function createBerita(payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("berita")
    .insert([payload])
    .select()
    .single();
  if (error) { console.error("[beritaModel] createBerita:", error.message); return { error: error.message }; }
  return { data };
}

/**
 * Update berita
 * @param {number|string} id
 * @param {Object} payload
 * @returns {Promise<{data: Object}|{error: string}>}
 */
async function updateBerita(id, payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("berita")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[beritaModel] updateBerita:", error.message); return { error: error.message }; }
  return { data };
}

/**
 * Hapus berita
 * @param {number|string} id
 * @returns {Promise<{success: boolean}|{error: string}>}
 */
async function deleteBerita(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin
    .from("berita")
    .delete()
    .eq("id", id);
  if (error) { console.error("[beritaModel] deleteBerita:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = {
  getAllBerita,
  getBeritaBySlug,
  getBeritaTerbaru,
  getAllBeritaAdmin,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita,
};
