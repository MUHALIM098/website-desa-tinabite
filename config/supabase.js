/**
 * config/supabase.js — Konfigurasi Supabase Client
 *
 * Tiga client dibuat:
 * - supabaseAnon    : untuk operasi publik (query data biasa, SELECT publik)
 * - supabaseAdmin   : untuk operasi DB server-side SAJA (bypass RLS via service_role)
 *                     JANGAN gunakan untuk auth.signInWithPassword — akan mencemari session!
 * - supabaseAuth    : KHUSUS untuk verifikasi login admin (signInWithPassword)
 *                     Menggunakan anon key agar session user TIDAK masuk ke supabaseAdmin.
 *
 * MENGAPA DIPISAH:
 *   Supabase JS v2 menyimpan session user di memori client setelah signInWithPassword.
 *   Jika supabaseAdmin (service_role) digunakan untuk signInWithPassword, maka semua
 *   operasi DB berikutnya akan menggunakan JWT user (bukan service_role key),
 *   sehingga RLS memblokir INSERT/UPDATE/DELETE meskipun policy service_role sudah benar.
 *
 * PENTING: supabaseAdmin menggunakan SERVICE_ROLE_KEY.
 * Jangan pernah expose key ini ke client/browser.
 */

"use strict";

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY         = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Deteksi apakah credential sudah diisi dengan nilai asli (bukan placeholder)
const isValidUrl = (url) =>
  url &&
  url.startsWith("https://") &&
  !url.includes("your-project-ref") &&
  url.includes(".supabase.co");

// JWT Supabase selalu dimulai dengan 'eyJ' (base64 dari '{"alg"...')
const isValidKey = (key) => {
  if (!key) return false;

  // Legacy Supabase JWT keys
  if (key.startsWith("eyJ") && key.length > 50) {
    return !key.includes("your-") && !key.includes("-here");
  }

  // Supabase new API keys
  if (
    key.startsWith("sb_publishable_") ||
    key.startsWith("sb_secret_")
  ) {
    return key.length > 20;
  }

  return false;
};

const urlOk  = isValidUrl(SUPABASE_URL);
const anonOk = isValidKey(SUPABASE_ANON_KEY);
const svcOk  = isValidKey(SUPABASE_SERVICE_ROLE_KEY);

if (!urlOk || !anonOk) {
  console.warn("⚠️  [Supabase] SUPABASE_URL atau SUPABASE_ANON_KEY belum diisi dengan benar di .env");
}
if (urlOk && !svcOk) {
  console.warn("⚠️  [Supabase] SUPABASE_SERVICE_ROLE_KEY belum diisi — fitur admin (login, CRUD) tidak berfungsi.");
  console.warn("   Ambil service_role key dari: Supabase Dashboard → Settings → API");
}

/**
 * Client publik — untuk query data biasa (SELECT halaman publik).
 * null jika credential belum dikonfigurasi (mencegah timeout).
 */
const supabaseAnon = urlOk && anonOk
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        fetch: (...args) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000); // 8 detik timeout
          return fetch(...args, { signal: controller.signal }).finally(() =>
            clearTimeout(timeout)
          );
        },
      },
    })
  : null;

/**
 * Client autentikasi — KHUSUS untuk signInWithPassword di adminAuthController.
 * Menggunakan anon key sehingga session user tidak mencemari supabaseAdmin.
 * Jangan gunakan client ini untuk operasi DB langsung.
 */
const supabaseAuth = urlOk && anonOk
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * Client admin DB — HANYA untuk operasi database server-side (INSERT/UPDATE/DELETE/SELECT).
 * Menggunakan SERVICE_ROLE_KEY untuk bypass Row Level Security.
 * JANGAN panggil auth.signInWithPassword() pada client ini — akan mencemari in-memory session.
 * Jangan expose ke browser.
 */
const supabaseAdmin = urlOk && svcOk
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

module.exports = { supabaseAnon, supabaseAuth, supabaseAdmin };
