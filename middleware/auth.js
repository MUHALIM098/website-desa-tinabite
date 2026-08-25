/**
 * middleware/auth.js — Middleware Autentikasi Admin
 */
"use strict";

/**
 * Proteksi route admin: redirect ke /admin/login jika belum login
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/admin/login");
}

/**
 * Redirect ke dashboard jika sudah login (untuk halaman login)
 */
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return res.redirect("/admin");
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
