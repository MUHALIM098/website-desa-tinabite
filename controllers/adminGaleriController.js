/**
 * controllers/adminGaleriController.js — CRUD Galeri (Admin)
 */
"use strict";

const {
  getAllGaleriAdmin, getGaleriById,
  createGaleri, updateGaleri, deleteGaleri,
} = require("../models/galeriModel");
const { uploadFile, replaceFile, deleteFile } = require("../services/storageService");
const appConfig = require("../config/app");

const FOLDER = appConfig.storage.folders.galeri;

/** GET /admin/galeri */
async function index(req, res, next) {
  try {
    const daftarGaleri = await getAllGaleriAdmin();
    res.render("admin/galeri/index", {
      title: "Manajemen Galeri — Admin",
      pageTitle: "Galeri Foto",
      layout: "layouts/admin",
      activePage: "galeri",
      adminEmail: req.session.admin?.email,
      daftarGaleri,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

/** GET /admin/galeri/tambah */
function showCreate(req, res) {
  res.render("admin/galeri/form", {
    title: "Tambah Foto — Admin",
    pageTitle: "Tambah Foto Galeri",
    layout: "layouts/admin",
    activePage: "galeri",
    adminEmail: req.session.admin?.email,
    galeri: null,
    error: null,
  });
}

/** POST /admin/galeri/tambah */
async function create(req, res, next) {
  try {
    const { judul, deskripsi, urutan } = req.body;
    if (!judul || !req.file) {
      return res.render("admin/galeri/form", {
        title: "Tambah Foto — Admin", pageTitle: "Tambah Foto Galeri",
        layout: "layouts/admin", activePage: "galeri",
        adminEmail: req.session.admin?.email,
        galeri: req.body, error: "Judul dan foto wajib diisi.",
      });
    }

    const hasil = await uploadFile(FOLDER, req.file.originalname, req.file.buffer, req.file.mimetype);
    if (hasil.error) {
      return res.render("admin/galeri/form", {
        title: "Tambah Foto — Admin", pageTitle: "Tambah Foto Galeri",
        layout: "layouts/admin", activePage: "galeri",
        adminEmail: req.session.admin?.email,
        galeri: req.body, error: "Gagal upload foto: " + hasil.error,
      });
    }

    const { error } = await createGaleri({
      judul, deskripsi,
      foto_url: hasil.url, foto_path: hasil.path,
      urutan: urutan ? parseInt(urutan) : 0,
    });
    if (error) {
      return res.render("admin/galeri/form", {
        title: "Tambah Foto — Admin", pageTitle: "Tambah Foto Galeri",
        layout: "layouts/admin", activePage: "galeri",
        adminEmail: req.session.admin?.email,
        galeri: req.body, error: "Gagal menyimpan: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Foto berhasil ditambahkan." };
    res.redirect("/admin/galeri");
  } catch (err) { next(err); }
}

/** GET /admin/galeri/:id/edit */
async function showEdit(req, res, next) {
  try {
    const galeri = await getGaleriById(req.params.id);
    if (!galeri) return res.redirect("/admin/galeri");
    res.render("admin/galeri/form", {
      title: "Edit Foto — Admin", pageTitle: "Edit Foto Galeri",
      layout: "layouts/admin", activePage: "galeri",
      adminEmail: req.session.admin?.email,
      galeri, error: null,
    });
  } catch (err) { next(err); }
}

/** POST /admin/galeri/:id/edit */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { judul, deskripsi, urutan } = req.body;
    const existing = await getGaleriById(id);
    if (!existing) return res.redirect("/admin/galeri");

    let foto_url = existing.foto_url, foto_path = existing.foto_path;
    if (req.file) {
      const hasil = await replaceFile(existing.foto_path, FOLDER, req.file.originalname, req.file.buffer, req.file.mimetype);
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    }

    const { error } = await updateGaleri(id, {
      judul, deskripsi, foto_url, foto_path,
      urutan: urutan ? parseInt(urutan) : existing.urutan,
    });
    if (error) {
      return res.render("admin/galeri/form", {
        title: "Edit Foto — Admin", pageTitle: "Edit Foto Galeri",
        layout: "layouts/admin", activePage: "galeri",
        adminEmail: req.session.admin?.email,
        galeri: { ...existing, ...req.body }, error: "Gagal update: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Foto berhasil diperbarui." };
    res.redirect("/admin/galeri");
  } catch (err) { next(err); }
}

/** POST /admin/galeri/:id/hapus */
async function hapus(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getGaleriById(id);
    if (existing?.foto_path) await deleteFile(existing.foto_path);
    await deleteGaleri(id);
    req.session.flash = { type: "success", msg: "Foto berhasil dihapus." };
    res.redirect("/admin/galeri");
  } catch (err) { next(err); }
}

module.exports = { index, showCreate, create, showEdit, update, hapus };
