/**
 * controllers/adminKontakController.js — Manajemen Pesan Kontak (Admin)
 */
"use strict";

const { getAllPesan, tandaiDibaca, deletePesan } = require("../models/kontakModel");

/** GET /admin/kontak */
async function index(req, res, next) {
  try {
    const daftarPesan = await getAllPesan();
    res.render("admin/kontak/index", {
      title: "Pesan Masuk — Admin",
      pageTitle: "Pesan Masuk",
      layout: "layouts/admin",
      activePage: "kontak",
      adminEmail: req.session.admin?.email,
      daftarPesan,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

/** POST /admin/kontak/:id/baca */
async function tandaiBaca(req, res, next) {
  try {
    await tandaiDibaca(req.params.id);
    req.session.flash = { type: "success", msg: "Pesan ditandai sudah dibaca." };
    res.redirect("/admin/kontak");
  } catch (err) { next(err); }
}

/** POST /admin/kontak/:id/hapus */
async function hapus(req, res, next) {
  try {
    await deletePesan(req.params.id);
    req.session.flash = { type: "success", msg: "Pesan berhasil dihapus." };
    res.redirect("/admin/kontak");
  } catch (err) { next(err); }
}

module.exports = { index, tandaiBaca, hapus };
