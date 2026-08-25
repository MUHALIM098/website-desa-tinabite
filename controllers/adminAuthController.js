/**
 * controllers/adminAuthController.js — Login & Logout Admin
 *
 * Menggunakan Supabase Auth (signInWithPassword) untuk autentikasi.
 * PENTING: Menggunakan supabaseAuth (anon key), BUKAN supabaseAdmin (service_role).
 * Hal ini untuk mencegah session user mencemari in-memory session supabaseAdmin,
 * yang akan menyebabkan RLS memblokir operasi DB berikutnya.
 * Data user disimpan di req.session.admin setelah login berhasil.
 */
"use strict";

const { supabaseAuth } = require("../config/supabase");

/** GET /admin/login */
function showLogin(req, res) {
  res.render("admin/login", {
    title: "Login Admin — Desa Tinabite",
    layout: "layouts/admin-auth",
    error: req.session.flashError || null,
  });
  delete req.session.flashError;
}

/** POST /admin/login */
async function processLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.flashError = "Email dan password wajib diisi.";
    return res.redirect("/admin/login");
  }

  if (!supabaseAuth) {
    req.session.flashError = "Supabase belum dikonfigurasi. Isi .env terlebih dahulu.";
    return res.redirect("/admin/login");
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data?.user) {
      // Tampilkan error asli Supabase di terminal untuk debugging
      if (error) {
        console.error("[Auth] Supabase error:", error.message, `(code: ${error.code || '-'})`);
      }
      req.session.flashError = "Email atau password salah.";
      return res.redirect("/admin/login");
    }

    // Simpan info admin ke session
    req.session.admin = {
      id: data.user.id,
      email: data.user.email,
    };

    const returnTo = req.session.returnTo || "/admin";
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    req.session.flashError = "Terjadi kesalahan server. Coba lagi.";
    res.redirect("/admin/login");
  }
}

/** POST /admin/logout */
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

module.exports = { showLogin, processLogin, logout };
