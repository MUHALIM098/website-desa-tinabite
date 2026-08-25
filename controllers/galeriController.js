/**
 * controllers/galeriController.js
 * Handler untuk halaman Galeri
 */
"use strict";

const appConfig = require("../config/app");
const { getAllGaleri } = require("../models/galeriModel");

/** GET /galeri */
async function galeri(req, res, next) {
  try {
    const foto = await getAllGaleri();
    // Kelompokkan foto berdasarkan kategori
    const fotoByKategori = foto.reduce((acc, item) => {
      const kat = item.kategori || "Umum";
      if (!acc[kat]) acc[kat] = [];
      acc[kat].push(item);
      return acc;
    }, {});
    res.render("public/galeri", {
      title: "Galeri — " + appConfig.desa.nama,
      desa: appConfig.desa,
      foto,
      fotoByKategori,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { galeri };
