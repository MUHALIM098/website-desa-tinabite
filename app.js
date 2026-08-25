/**
 * app.js — Entry point utama Website Desa Tinabite
 *
 * File ini mengkonfigurasi dan menjalankan Express server:
 * - Load environment variables
 * - Setup middleware (security, logging, parsing)
 * - Setup template engine EJS
 * - Mount routes
 * - Error handling
 */

"use strict";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

// Load environment variables dari file .env
require("dotenv").config();

// Import routes
const publicRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");

// Import error handler middleware
const errorHandler = require("./middleware/errorHandler");

// ============================================================
// Inisialisasi Express App
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Security Middleware
// ============================================================
// Helmet menambahkan berbagai HTTP header untuk keamanan
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://*.supabase.co"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        // Izinkan Google Maps ditampilkan di iframe
        frameSrc: [
          "'self'",
          "https://www.google.com"
        ],
      },
    },
  })
);

// Kompresi response untuk performa lebih baik
app.use(compression());

// ============================================================
// Request Logging
// ============================================================
// 'dev' format: ringkas untuk development, 'combined' untuk production
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// ============================================================
// Session Middleware
// ============================================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-ganti-ini",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    },
  })
);

// ============================================================
// Body Parser Middleware
// ============================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ============================================================
// Static Files
// ============================================================
// Serve file statis (CSS, JS, gambar) dari folder /public
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// Template Engine — EJS + Layouts
// ============================================================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Tentukan file layout default
app.set("layout", "layouts/main");

// ============================================================
// Background Website Dinamis dari Supabase
// ============================================================
// Middleware ini berjalan di setiap request halaman PUBLIK.
// Mengambil kunci "background_website" dari tabel profil_desa.
// Hasilnya disimpan ke res.locals.backgroundUrl sehingga
// otomatis tersedia di semua view tanpa perlu mengubah controller.
// Fallback ke /images/desa-tinabite-bg.jpg jika belum dikonfigurasi.
// ============================================================
const { getAllProfil: _getProfilForBg } = require("./models/profilModel");

// Cache sederhana — hindari query ke Supabase setiap request
let _bgUrlCache = null;
let _bgUrlCacheAt = 0;
const BG_CACHE_TTL = 5 * 60 * 1000; // 5 menit

app.use(async (req, res, next) => {
  // Hanya untuk halaman publik (bukan /admin, /css, /js, /images)
  if (
    req.path.startsWith("/admin") ||
    req.path.startsWith("/css") ||
    req.path.startsWith("/js") ||
    req.path.startsWith("/images") ||
    req.path.startsWith("/favicon")
  ) {
    return next();
  }

  try {
    const now = Date.now();
    // Gunakan cache jika belum expired
    if (_bgUrlCache === null || now - _bgUrlCacheAt > BG_CACHE_TTL) {
      const profil = await _getProfilForBg();
      const raw = profil.background_website && profil.background_website.konten
        ? profil.background_website.konten.trim()
        : "";
      _bgUrlCache = raw || "/images/desa-tinabite-bg.jpg";
      _bgUrlCacheAt = now;
    }
    res.locals.backgroundUrl = _bgUrlCache;
  } catch (e) {
    // Jika gagal ambil dari DB, gunakan fallback — jangan sampai error
    res.locals.backgroundUrl = "/images/desa-tinabite-bg.jpg";
  }
  next();
});

// ============================================================
// Routes
// ============================================================
app.use("/", publicRoutes);
app.use("/admin", adminRoutes);

// ============================================================
// 404 Handler — Route tidak ditemukan
// ============================================================
app.use((req, res, next) => {
  res.status(404).render("public/404", {
    title: "Halaman Tidak Ditemukan — Desa Tinabite",
    layout: "layouts/main",
  });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================
// Di Vercel, module ini di-import sebagai handler, bukan dijalankan langsung.
// Cek apakah file ini dijalankan langsung (node app.js) atau di-import (Vercel).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("================================================");
    console.log(`  🏡 Website Desa Tinabite`);
    console.log(`  🚀 Server berjalan di: http://localhost:${PORT}`);
    console.log(`  🌿 Mode: ${process.env.NODE_ENV || "development"}`);
    console.log("================================================");
  });
}

// Export app untuk Vercel serverless function
module.exports = app;
