/**
 * routes/index.js — Public Routes
 */
"use strict";

const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const profilController = require("../controllers/profilController");
const potensiController = require("../controllers/potensiController");
const beritaController = require("../controllers/beritaController");
const galeriController = require("../controllers/galeriController");
const kontakController = require("../controllers/kontakController");

// Beranda
router.get("/", homeController.index);

// Halaman Test (hapus sebelum production)
router.get("/test", homeController.testPage);

// Profil & Pemerintahan
router.get("/profil", profilController.profilDesa);
router.get("/pemerintahan", profilController.pemerintahan);

// Potensi Desa
router.get("/potensi", potensiController.potensiDesa);

// Berita & Pengumuman
router.get("/berita", beritaController.daftarBerita);
router.get("/berita/:slug", beritaController.detailBerita);

// Galeri
router.get("/galeri", galeriController.galeri);

// Kontak
router.get("/kontak", kontakController.tampilKontak);
router.post("/kontak", kontakController.kirimPesan);

module.exports = router;
