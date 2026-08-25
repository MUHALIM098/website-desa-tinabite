/**
 * models/profilModel.js — Query ke tabel profil_desa & statistik_desa
 */
"use strict";

const { supabaseAnon } = require("../config/supabase");

/**
 * Ambil semua konten profil desa (sejarah, visi, misi, dll.)
 * @returns {Promise<Object>} Object dengan kunci sebagai key konten
 */
async function getAllProfil() {
  if (!supabaseAnon) return {};
  const { data, error } = await supabaseAnon
    .from("profil_desa")
    .select("*")
    .order("kunci");
  if (error) { console.error("[profilModel] getAllProfil:", error.message); return {}; }
  // Ubah array menjadi object { sejarah: {...}, visi: {...}, ... }
  return data.reduce((acc, item) => { acc[item.kunci] = item; return acc; }, {});
}

/**
 * Ambil semua statistik desa
 * @returns {Promise<Array>}
 */
async function getAllStatistik() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("statistik_desa")
    .select("*")
    .order("kategori");
  if (error) { console.error("[profilModel] getAllStatistik:", error.message); return []; }
  return data || [];
}

/**
 * Ambil semua data sarana dan prasarana desa dari tabel sarana_prasarana
 * @returns {Promise<Array>}
 */
async function getAllSaranaPrasarana() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("sarana_prasarana")
    .select("id, kategori, nama, jumlah, satuan, urutan")
    .order("kategori")
    .order("urutan", { ascending: true })
    .order("nama", { ascending: true });
  if (error) { console.error("[profilModel] getAllSaranaPrasarana:", error.message); return []; }
  return data || [];
}

module.exports = { getAllProfil, getAllStatistik, getAllSaranaPrasarana };
