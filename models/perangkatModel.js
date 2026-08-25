/**
 * models/perangkatModel.js — Query ke tabel perangkat_desa
 *
 * Struktur tabel perangkat_desa di Supabase:
 * ─────────────────────────────────────────────
 * id            UUID PRIMARY KEY DEFAULT uuid_generate_v4()
 * nama          VARCHAR(255) NOT NULL
 * jabatan       VARCHAR(255) NOT NULL
 * foto_url      TEXT
 * foto_path     TEXT        -- path di Supabase Storage (untuk hapus/ganti)
 * urutan        INTEGER DEFAULT 0
 * aktif         BOOLEAN DEFAULT TRUE
 * motto         TEXT        -- motto/semboyan
 * profil        TEXT        -- profil singkat
 * pendidikan    TEXT        -- riwayat pendidikan
 * pengalaman    TEXT        -- riwayat jabatan/pengalaman
 * created_at    TIMESTAMPTZ DEFAULT NOW()
 * updated_at    TIMESTAMPTZ DEFAULT NOW()
 *
 * Jalankan database/migration_profil_perangkat.sql di Supabase untuk field baru.
 */
"use strict";

const { supabaseAnon, supabaseAdmin } = require("../config/supabase");

// ============================================================
// Public reads
// ============================================================

/**
 * Ambil semua perangkat desa yang aktif, diurutkan berdasarkan kolom urutan
 * @returns {Promise<Array>}
 */
async function getAllPerangkat() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("perangkat_desa")
    .select("*")
    .eq("aktif", true)
    .order("urutan", { ascending: true });
  if (error) { console.error("[perangkatModel] getAllPerangkat:", error.message); return []; }
  return data || [];
}

// ============================================================
// Admin Operations
// ============================================================

/**
 * Ambil semua perangkat desa (termasuk nonaktif) untuk admin
 * @returns {Promise<Array>}
 */
async function getAllPerangkatAdmin() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("perangkat_desa")
    .select("*")
    .order("urutan", { ascending: true })
    .order("nama", { ascending: true });
  if (error) { console.error("[perangkatModel] getAllPerangkatAdmin:", error.message); return []; }
  return data || [];
}

/**
 * Ambil satu perangkat berdasarkan ID (admin)
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getPerangkatById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("perangkat_desa")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[perangkatModel] getPerangkatById:", error.message); return null; }
  return data || null;
}

/**
 * Tambah perangkat baru
 * @param {Object} payload
 * @returns {Promise<{data: Object}|{error: string}>}
 */
async function createPerangkat(payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("perangkat_desa")
    .insert([{ ...payload, updated_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) { console.error("[perangkatModel] createPerangkat:", error.message); return { error: error.message }; }
  return { data };
}

/**
 * Perbarui perangkat berdasarkan ID
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<{data: Object}|{error: string}>}
 */
async function updatePerangkat(id, payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("perangkat_desa")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[perangkatModel] updatePerangkat:", error.message); return { error: error.message }; }
  return { data };
}

/**
 * Hapus perangkat berdasarkan ID
 * @param {string} id
 * @returns {Promise<{success: boolean}|{error: string}>}
 */
async function deletePerangkat(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin
    .from("perangkat_desa")
    .delete()
    .eq("id", id);
  if (error) { console.error("[perangkatModel] deletePerangkat:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = {
  getAllPerangkat,
  getAllPerangkatAdmin,
  getPerangkatById,
  createPerangkat,
  updatePerangkat,
  deletePerangkat,
};
