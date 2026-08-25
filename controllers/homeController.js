/**
 * controllers/homeController.js — Handler untuk halaman Beranda & Test
 */
"use strict";

const appConfig = require("../config/app");
const { getBeritaTerbaru } = require("../models/beritaModel");
const { getAllProfil, getAllStatistik } = require("../models/profilModel");
const { formatTanggal } = require("../utils/helpers");

/** GET / — Halaman Beranda */
async function index(req, res, next) {
  try {
    const [beritaTerbaru, profil, statistik] = await Promise.all([
      getBeritaTerbaru(3),
      getAllProfil(),
      getAllStatistik(),
    ]);

    // Ambil URL maps dari profil_desa kunci "maps"
    const mapsUrl = (profil.maps && profil.maps.konten && profil.maps.konten.trim())
      ? profil.maps.konten.trim()
      : "";

    // Ambil sejarah ringkas untuk section "Tentang Desa"
    const sejarahSingkat = (profil.sejarah && profil.sejarah.konten)
      ? profil.sejarah.konten.substring(0, 300).trim()
      : "";

    res.render("public/home", {
      title: "Beranda — " + appConfig.desa.nama,
      desa: appConfig.desa,
      beritaTerbaru,
      statistik,
      mapsUrl,
      sejarahSingkat,
      formatTanggal,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /test — Halaman test setup */
function testPage(req, res) {
  const supabaseConfigured = !!(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  );
  res.render("public/test", {
    title: "Test Halaman — " + appConfig.desa.nama,
    layout: "layouts/main",
    supabaseConfigured,
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    desa: appConfig.desa,
    timestamp: new Date().toLocaleString("id-ID"),
  });
}

module.exports = { index, testPage };
