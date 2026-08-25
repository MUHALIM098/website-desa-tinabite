/**
 * models/kondisiModel.js — Query ke tabel kondisi_desa
 *
 * Struktur tabel kondisi_desa di Supabase:
 * ─────────────────────────────────────────────
 * id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
 * kategori    text NOT NULL  → 'demografi' | 'keadaan_sosial' | 'keadaan_ekonomi'
 * sub_kategori text NOT NULL → lihat konstanta KONDISI_MAP di bawah
 * judul       text NOT NULL
 * konten      text           → narasi/deskripsi panjang
 * nilai       text           → nilai ringkas (angka/teks pendek), opsional
 * satuan      text           → satuan nilai (jiwa, ha, dll.), opsional
 * urutan      integer DEFAULT 0
 * updated_at  timestamptz DEFAULT now()
 */
"use strict";

const { supabaseAnon } = require("../config/supabase");
const { supabaseAdmin } = require("../config/supabase");

/** Peta kategori → sub_kategori yang valid */
const KONDISI_MAP = {
  demografi: [
    { key: "batas_wilayah",  label: "Batas Wilayah Desa" },
    { key: "luas_wilayah",   label: "Luas Wilayah Desa" },
    { key: "jumlah_penduduk",label: "Jumlah Penduduk (Jenis Kelamin)" },
  ],
  keadaan_sosial: [
    { key: "pendidikan",          label: "Pendidikan" },
    { key: "lembaga_pendidikan",  label: "Lembaga Pendidikan" },
    { key: "kesehatan",           label: "Kesehatan" },
    { key: "keagamaan",           label: "Keagamaan" },
  ],
  keadaan_ekonomi: [
    { key: "pertanian",          label: "Pertanian" },
    { key: "peternakan",         label: "Peternakan" },
    { key: "perikanan",          label: "Perikanan" },
    { key: "mata_pencaharian",   label: "Struktur Mata Pencaharian" },
  ],
};

const KATEGORI_LABELS = {
  demografi:       "Demografi",
  keadaan_sosial:  "Keadaan Sosial",
  keadaan_ekonomi: "Keadaan Ekonomi",
};

// ============================================================
// Public reads
// ============================================================

async function getAllKondisi() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("kondisi_desa")
    .select("*")
    .order("urutan", { ascending: true });
  if (error) { console.error("[kondisiModel] getAllKondisi:", error.message); return []; }
  return data || [];
}

// ============================================================
// Admin Operations
// ============================================================

async function getAllKondisiAdmin() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("kondisi_desa")
    .select("*")
    .order("kategori")
    .order("urutan");
  if (error) { console.error("[kondisiModel] getAllKondisiAdmin:", error.message); return []; }
  return data || [];
}

async function getKondisiById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("kondisi_desa").select("*").eq("id", id).single();
  if (error) { console.error("[kondisiModel] getKondisiById:", error.message); return null; }
  return data || null;
}

async function createKondisi(payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("kondisi_desa").insert([{ ...payload, updated_at: new Date().toISOString() }]).select().single();
  if (error) { console.error("[kondisiModel] createKondisi:", error.message); return { error: error.message }; }
  return { data };
}

async function updateKondisi(id, payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin
    .from("kondisi_desa").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) { console.error("[kondisiModel] updateKondisi:", error.message); return { error: error.message }; }
  return { data };
}

async function deleteKondisi(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin.from("kondisi_desa").delete().eq("id", id);
  if (error) { console.error("[kondisiModel] deleteKondisi:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = {
  KONDISI_MAP,
  KATEGORI_LABELS,
  getAllKondisi,
  getAllKondisiAdmin,
  getKondisiById,
  createKondisi,
  updateKondisi,
  deleteKondisi,
};
