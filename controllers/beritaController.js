/**
 * controllers/beritaController.js
 * Handler untuk halaman daftar berita dan detail berita
 */
"use strict";

const appConfig = require("../config/app");
const { getAllBerita, getBeritaBySlug } = require("../models/beritaModel");
const { formatTanggal } = require("../utils/helpers");

/** GET /berita */
async function daftarBerita(req, res, next) {
  try {
    // Baca filter kategori dari query string: /berita?kategori=pengumuman
    const { kategori } = req.query;
    const berita = await getAllBerita(kategori || null);
    res.render("public/berita", {
      title: "Berita & Pengumuman — " + appConfig.desa.nama,
      desa: appConfig.desa,
      berita,
      kategoriAktif: kategori || "semua",
      formatTanggal,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /berita/:slug */
async function detailBerita(req, res, next) {
  try {
    const berita = await getBeritaBySlug(req.params.slug);
    if (!berita) {
      return res.status(404).render("public/404", {
        title: "Berita Tidak Ditemukan — " + appConfig.desa.nama,
        layout: "layouts/main",
      });
    }
    res.render("public/berita-detail", {
      title: berita.judul + " — " + appConfig.desa.nama,
      desa: appConfig.desa,
      berita,
      formatTanggal,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { daftarBerita, detailBerita };
