/**
 * models/potensiModel.js — Query ke tabel potensi_desa
 *
 * Kolom tabel: id, judul, kategori, deskripsi, foto_url, created_at, updated_at
 *
 * Kategori yang valid: 'pertanian' | 'perkebunan' | 'peternakan' | 'wisata'
 * Data dengan kategori di luar empat ini tidak ditampilkan di publik.
 */
"use strict";

const { supabaseAnon, supabaseAdmin } = require("../config/supabase");

const POTENSI_KATEGORI = [
  { key: "pertanian", label: "Pertanian" },
  { key: "perkebunan", label: "Perkebunan" },
  { key: "peternakan", label: "Peternakan" },
  { key: "wisata", label: "Wisata" },
];

// Kunci kategori valid — digunakan untuk filter query
const KATEGORI_VALID = POTENSI_KATEGORI.map(k => k.key);

/**
 * Ambil semua potensi desa — hanya 4 kategori valid (publik)
 * @returns {Promise<Array>}
 */
async function getAllPotensi() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("potensi_desa")
    .select("id, kategori, judul, deskripsi, foto_url")
    .in("kategori", KATEGORI_VALID)
    .order("kategori")
    .order("judul", { ascending: true });
  if (error) { console.error("[potensiModel] getAllPotensi:", error.message); return []; }
  return data || [];
}

// ============================================================
// Admin Operations
// ============================================================

async function getAllPotensiAdmin() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("potensi_desa")
    .select("id, kategori, judul, deskripsi, foto_url, created_at, updated_at")
    .in("kategori", KATEGORI_VALID)
    .order("kategori")
    .order("judul", { ascending: true });
  if (error) { console.error("[potensiModel] getAllPotensiAdmin:", error.message); return []; }
  return data || [];
}

async function getPotensiById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("potensi_desa")
    .select("id, kategori, judul, deskripsi, foto_url, foto_path, created_at, updated_at")
    .eq("id", id).single();
  if (error) { console.error("[potensiModel] getPotensiById:", error.message); return null; }
  return data || null;
}

async function createPotensi(payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const safe = {
    kategori: payload.kategori,
    judul: payload.judul,
    deskripsi: payload.deskripsi || null,
    foto_url: payload.foto_url || null,
    foto_path: payload.foto_path || null,
  };
  const { data, error } = await supabaseAdmin
    .from("potensi_desa").insert([safe]).select().single();
  if (error) { console.error("[potensiModel] createPotensi:", error.message); return { error: error.message }; }
  return { data };
}

async function updatePotensi(id, payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const safe = {
    kategori: payload.kategori,
    judul: payload.judul,
    deskripsi: payload.deskripsi || null,
    foto_url: payload.foto_url !== undefined ? payload.foto_url : null,
    foto_path: payload.foto_path !== undefined ? payload.foto_path : null,
  };
  const { data, error } = await supabaseAdmin
    .from("potensi_desa").update(safe).eq("id", id).select().single();
  if (error) { console.error("[potensiModel] updatePotensi:", error.message); return { error: error.message }; }
  return { data };
}

async function deletePotensi(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin.from("potensi_desa").delete().eq("id", id);
  if (error) { console.error("[potensiModel] deletePotensi:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = {
  POTENSI_KATEGORI,
  KATEGORI_VALID,
  getAllPotensi,
  getAllPotensiAdmin,
  getPotensiById,
  createPotensi,
  updatePotensi,
  deletePotensi,
};
