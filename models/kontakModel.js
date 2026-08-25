/**
 * models/kontakModel.js — Query ke tabel kontak/pesan_kontak
 */
"use strict";

const { supabaseAnon } = require("../config/supabase");
const { supabaseAdmin } = require("../config/supabase");

/**
 * Simpan pesan kontak dari pengunjung ke database
 * @param {{ nama: string, email: string, subjek: string, pesan: string }} data
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function simpanPesan({ nama, email, subjek, pesan }) {
  if (!supabaseAnon) return { success: false, error: "Database belum dikonfigurasi." };
  const { error } = await supabaseAnon
    .from("pesan_kontak")
    .insert([{ nama, email, subjek, pesan }]);
  if (error) {
    console.error("[kontakModel] simpanPesan:", error.message);
    return { success: false, error: "Gagal menyimpan pesan. Silakan coba lagi." };
  }
  return { success: true };
}

// ============================================================
// Admin Operations
// ============================================================

/**
 * Ambil semua pesan kontak untuk panel admin
 */
async function getAllPesan() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("pesan_kontak")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[kontakModel] getAllPesan:", error.message); return []; }
  return data || [];
}

/**
 * Tandai pesan sebagai sudah dibaca
 */
async function tandaiDibaca(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin
    .from("pesan_kontak")
    .update({ dibaca: true })
    .eq("id", id);
  if (error) { console.error("[kontakModel] tandaiDibaca:", error.message); return { error: error.message }; }
  return { success: true };
}

/**
 * Hapus pesan kontak
 */
async function deletePesan(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin.from("pesan_kontak").delete().eq("id", id);
  if (error) { console.error("[kontakModel] deletePesan:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = { simpanPesan, getAllPesan, tandaiDibaca, deletePesan };
