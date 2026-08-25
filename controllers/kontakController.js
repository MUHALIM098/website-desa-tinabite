/**
 * controllers/kontakController.js
 * Handler untuk halaman Kontak (tampilkan form + proses pengiriman)
 */
"use strict";

const appConfig = require("../config/app");
const { simpanPesan } = require("../models/kontakModel");

/** GET /kontak */
function tampilKontak(req, res) {
  const statusSukses = req.query.status === "sukses";
  res.render("public/kontak", {
    title: "Kontak — " + appConfig.desa.nama,
    desa: appConfig.desa,
    statusSukses,
    error: null,
    formData: {},
  });
}

/** POST /kontak */
async function kirimPesan(req, res, next) {
  try {
    const { nama, email, subjek, pesan } = req.body;

    // Validasi sederhana di server
    if (!nama || !pesan) {
      return res.render("public/kontak", {
        title: "Kontak — " + appConfig.desa.nama,
        desa: appConfig.desa,
        statusSukses: false,
        error: "Nama dan pesan wajib diisi.",
        formData: { nama, email, subjek, pesan },
      });
    }

    const result = await simpanPesan({ nama, email, subjek, pesan });

    if (!result.success) {
      return res.render("public/kontak", {
        title: "Kontak — " + appConfig.desa.nama,
        desa: appConfig.desa,
        statusSukses: false,
        error: result.error,
        formData: { nama, email, subjek, pesan },
      });
    }

    // Redirect dengan pesan sukses
    res.redirect("/kontak?status=sukses");
  } catch (err) {
    next(err);
  }
}

module.exports = { tampilKontak, kirimPesan };
