/**
 * models/galeriModel.js — Query ke tabel galeri
 */
"use strict";

const { supabaseAnon } = require("../config/supabase");
const { supabaseAdmin } = require("../config/supabase");

/**
 * Ambil semua foto galeri, diurutkan berdasarkan urutan lalu tanggal terbaru
 * @returns {Promise<Array>}
 */
async function getAllGaleri() {
  if (!supabaseAnon) return [];
  const { data, error } = await supabaseAnon
    .from("galeri")
    .select("*")
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) { console.error("[galeriModel] getAllGaleri:", error.message); return []; }
  return data || [];
}

// ============================================================
// Admin Operations
// ============================================================

/**
 * Ambil semua galeri untuk panel admin
 */
async function getAllGaleriAdmin() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("galeri")
    .select("id, judul, foto_url, foto_path, urutan, created_at")
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) { console.error("[galeriModel] getAllGaleriAdmin:", error.message); return []; }
  return data || [];
}

async function getGaleriById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("galeri").select("*").eq("id", id).single();
  if (error) { console.error("[galeriModel] getGaleriById:", error.message); return null; }
  return data || null;
}

async function createGaleri(payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin.from("galeri").insert([payload]).select().single();
  if (error) { console.error("[galeriModel] createGaleri:", error.message); return { error: error.message }; }
  return { data };
}

async function updateGaleri(id, payload) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { data, error } = await supabaseAdmin.from("galeri").update(payload).eq("id", id).select().single();
  if (error) { console.error("[galeriModel] updateGaleri:", error.message); return { error: error.message }; }
  return { data };
}

async function deleteGaleri(id) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };
  const { error } = await supabaseAdmin.from("galeri").delete().eq("id", id);
  if (error) { console.error("[galeriModel] deleteGaleri:", error.message); return { error: error.message }; }
  return { success: true };
}

module.exports = {
  getAllGaleri,
  getAllGaleriAdmin,
  getGaleriById,
  createGaleri,
  updateGaleri,
  deleteGaleri,
};
