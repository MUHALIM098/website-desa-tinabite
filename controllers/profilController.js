/**
 * controllers/profilController.js
 * Handler untuk halaman Profil Desa dan Pemerintahan
 */
"use strict";

const appConfig = require("../config/app");
const { getAllProfil, getAllStatistik, getAllSaranaPrasarana } = require("../models/profilModel");
const { getAllPerangkat } = require("../models/perangkatModel");

/** GET /profil */
async function profilDesa(req, res, next) {
  try {
    const [profil, statistik, saranaPrasaranaDb] = await Promise.all([
      getAllProfil(),
      getAllStatistik(),
      getAllSaranaPrasarana(),
    ]);

    // Kelompokkan sarana prasarana per kategori
    const KATEGORI_SARPRAS = ["Kesehatan", "Pendidikan", "Ibadah", "Umum"];
    const sarprasByKategori = {};
    KATEGORI_SARPRAS.forEach(k => { sarprasByKategori[k] = []; });
    saranaPrasaranaDb.forEach(item => {
      const kat = item.kategori;
      if (!sarprasByKategori[kat]) sarprasByKategori[kat] = [];
      sarprasByKategori[kat].push(item);
    });

    res.render("public/profil", {
      title: "Profil Desa — " + appConfig.desa.nama,
      desa: appConfig.desa,
      profil,
      statistik,
      sarprasByKategori,
      KATEGORI_SARPRAS,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /pemerintahan */
async function pemerintahan(req, res, next) {
  try {
    const perangkat = await getAllPerangkat();
    res.render("public/pemerintahan", {
      title: "Pemerintahan — " + appConfig.desa.nama,
      desa: appConfig.desa,
      perangkat,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { profilDesa, pemerintahan };
