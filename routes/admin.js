/**
 * routes/admin.js — Admin Routes
 *
 * Semua route /admin dengan:
 * - requireAuth   : proteksi halaman yang butuh login
 * - redirectIfAuth: redirect jika sudah login (halaman login)
 * - multer upload : parse multipart/form-data untuk upload gambar
 */

"use strict";

const express = require("express");
const multer = require("multer");
const router = express.Router();

const { requireAuth, redirectIfAuth } = require("../middleware/auth");

// Multer: simpan di memory (Buffer), bukan di disk — kompatibel dengan Vercel
// Upload gambar saja (untuk galeri, potensi, pemerintahan, berita)
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // maks 20MB
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diperbolehkan."));
    }
  },
});

// Alias lama agar route lain tidak berubah
const upload = uploadImage;

// Controllers
const adminAuthController = require("../controllers/adminAuthController");
const adminController = require("../controllers/adminController");
const adminBeritaController = require("../controllers/adminBeritaController");
const adminGaleriController = require("../controllers/adminGaleriController");
const adminKontakController = require("../controllers/adminKontakController");
const adminPemerintahanController = require("../controllers/adminPemerintahanController");
const adminPotensiController = require("../controllers/adminPotensiController");

// ============================================================
// Autentikasi (tidak butuh login)
// ============================================================
router.get("/login", redirectIfAuth, adminAuthController.showLogin);
router.post("/login", redirectIfAuth, adminAuthController.processLogin);
router.post("/logout", adminAuthController.logout);

// ============================================================
// Dashboard
// ============================================================
router.get("/", requireAuth, adminController.dashboard);

// ============================================================
// Berita
// ============================================================
router.get("/berita", requireAuth, adminBeritaController.index);
router.get("/berita/tambah", requireAuth, adminBeritaController.showCreate);
router.post("/berita/tambah", requireAuth, uploadImage.single("foto"), adminBeritaController.create);
router.get("/berita/:id/edit", requireAuth, adminBeritaController.showEdit);
router.post("/berita/:id/edit", requireAuth, uploadImage.single("foto"), adminBeritaController.update);
router.post("/berita/:id/hapus", requireAuth, adminBeritaController.hapus);

// ============================================================
// Galeri
// ============================================================
router.get("/galeri", requireAuth, adminGaleriController.index);
router.get("/galeri/tambah", requireAuth, adminGaleriController.showCreate);
router.post("/galeri/tambah", requireAuth, upload.single("foto"), adminGaleriController.create);
router.get("/galeri/:id/edit", requireAuth, adminGaleriController.showEdit);
router.post("/galeri/:id/edit", requireAuth, upload.single("foto"), adminGaleriController.update);
router.post("/galeri/:id/hapus", requireAuth, adminGaleriController.hapus);

// ============================================================
// Pesan Kontak
// ============================================================
router.get("/kontak", requireAuth, adminKontakController.index);
router.post("/kontak/:id/baca", requireAuth, adminKontakController.tandaiBaca);
router.post("/kontak/:id/hapus", requireAuth, adminKontakController.hapus);

// ============================================================
// Pemerintahan Desa (Perangkat Desa)
// ============================================================
router.get("/pemerintahan", requireAuth, adminPemerintahanController.index);
router.get("/pemerintahan/tambah", requireAuth, adminPemerintahanController.showCreate);
router.post("/pemerintahan/tambah", requireAuth, uploadImage.single("foto"), adminPemerintahanController.create);
router.get("/pemerintahan/:id/edit", requireAuth, adminPemerintahanController.showEdit);
router.post("/pemerintahan/:id/edit", requireAuth, uploadImage.single("foto"), adminPemerintahanController.update);
router.post("/pemerintahan/:id/hapus", requireAuth, adminPemerintahanController.hapus);
router.post("/pemerintahan/:id/toggle", requireAuth, adminPemerintahanController.toggleAktif);

// ============================================================
// Potensi Desa
// ============================================================
router.get("/potensi", requireAuth, adminPotensiController.index);
router.get("/potensi/tambah", requireAuth, adminPotensiController.showCreate);
router.post("/potensi/tambah", requireAuth, uploadImage.single("foto"), adminPotensiController.create);
router.get("/potensi/:id/edit", requireAuth, adminPotensiController.showEdit);
router.post("/potensi/:id/edit", requireAuth, uploadImage.single("foto"), adminPotensiController.update);
router.post("/potensi/:id/hapus", requireAuth, adminPotensiController.hapus);

module.exports = router;
