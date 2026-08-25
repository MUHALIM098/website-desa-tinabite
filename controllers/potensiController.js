/**
 * controllers/potensiController.js
 * Handler untuk halaman Potensi Desa
 */
"use strict";

const appConfig = require("../config/app");
const { getAllPotensi, POTENSI_KATEGORI } = require("../models/potensiModel");

/** GET /potensi */
async function potensiDesa(req, res, next) {
  try {
    const semua = await getAllPotensi();

    // Filter kategori dari query string — hanya izinkan 4 kategori valid
    const kategoriAktif = req.query.kategori || "semua";
    const kunciValid = POTENSI_KATEGORI.map(k => k.key);
    const potensi = (kategoriAktif === "semua" || !kunciValid.includes(kategoriAktif))
      ? semua
      : semua.filter(item => item.kategori === kategoriAktif);

    res.render("public/potensi", {
      title: "Potensi Desa — " + appConfig.desa.nama,
      desa: appConfig.desa,
      potensi,
      POTENSI_KATEGORI,
      kategoriAktif,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { potensiDesa };
