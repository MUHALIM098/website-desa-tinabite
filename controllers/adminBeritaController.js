/**
 * controllers/adminBeritaController.js — CRUD Berita (Admin)
 * Mendukung upload foto (image/*). Video tidak digunakan.
 */
"use strict";

const {
  getAllBeritaAdmin, getBeritaById,
  createBerita, updateBerita, deleteBerita,
} = require("../models/beritaModel");
const { uploadFile, replaceFile, deleteFile } = require("../services/storageService");
const appConfig = require("../config/app");

const FOLDER_FOTO = appConfig.storage.folders.berita;

// Helper: buat slug dari judul
function buatSlug(judul) {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80)
    + "-" + Date.now();
}

/** GET /admin/berita */
async function index(req, res, next) {
  try {
    const daftarBerita = await getAllBeritaAdmin();
    res.render("admin/berita/index", {
      title: "Manajemen Berita — Admin",
      pageTitle: "Berita & Pengumuman",
      layout: "layouts/admin",
      activePage: "berita",
      adminEmail: req.session.admin?.email,
      daftarBerita,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

/** GET /admin/berita/tambah */
function showCreate(req, res) {
  res.render("admin/berita/form", {
    title: "Tambah Berita — Admin",
    pageTitle: "Tambah Berita",
    layout: "layouts/admin",
    activePage: "berita",
    adminEmail: req.session.admin?.email,
    berita: null,
    error: null,
  });
}

/** POST /admin/berita/tambah */
async function create(req, res, next) {
  try {
    const { judul, ringkasan, konten, kategori, published } = req.body;

    if (!judul || !konten) {
      return res.render("admin/berita/form", {
        title: "Tambah Berita — Admin",
        pageTitle: "Tambah Berita",
        layout: "layouts/admin",
        activePage: "berita",
        adminEmail: req.session.admin?.email,
        berita: req.body,
        error: "Judul dan konten wajib diisi.",
      });
    }

    // Upload foto jika ada
    let foto_url = null, foto_path = null;
    if (req.file) {
      const hasil = await uploadFile(FOLDER_FOTO, req.file.originalname, req.file.buffer, req.file.mimetype);
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    }

    const isPublished = published === "1";
    const payload = {
      judul, ringkasan, konten,
      kategori: kategori || "berita",
      slug: buatSlug(judul),
      foto_url,
      foto_path,
      video_url: null,
      video_path: null,
      published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    };

    const { error } = await createBerita(payload);
    if (error) {
      return res.render("admin/berita/form", {
        title: "Tambah Berita — Admin",
        pageTitle: "Tambah Berita",
        layout: "layouts/admin",
        activePage: "berita",
        adminEmail: req.session.admin?.email,
        berita: req.body,
        error: "Gagal menyimpan berita: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Berita berhasil ditambahkan." };
    res.redirect("/admin/berita");
  } catch (err) { next(err); }
}

/** GET /admin/berita/:id/edit */
async function showEdit(req, res, next) {
  try {
    const berita = await getBeritaById(req.params.id);
    if (!berita) return res.redirect("/admin/berita");
    res.render("admin/berita/form", {
      title: "Edit Berita — Admin",
      pageTitle: "Edit Berita",
      layout: "layouts/admin",
      activePage: "berita",
      adminEmail: req.session.admin?.email,
      berita,
      error: null,
    });
  } catch (err) { next(err); }
}

/** POST /admin/berita/:id/edit */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { judul, ringkasan, konten, kategori, published, hapus_foto } = req.body;

    const existing = await getBeritaById(id);
    if (!existing) return res.redirect("/admin/berita");

    // Handle foto
    let foto_url = existing.foto_url;
    let foto_path = existing.foto_path;

    if (req.file) {
      // Ada foto baru — ganti yang lama
      const hasil = await replaceFile(existing.foto_path, FOLDER_FOTO, req.file.originalname, req.file.buffer, req.file.mimetype);
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    } else if (hapus_foto === "1") {
      // Admin centang hapus foto
      if (existing.foto_path) await deleteFile(existing.foto_path);
      foto_url = null; foto_path = null;
    }

    const isPublished = published === "1";
    const payload = {
      judul, ringkasan, konten,
      kategori: kategori || "berita",
      foto_url,
      foto_path,
      published: isPublished,
      published_at: isPublished ? (existing.published_at || new Date().toISOString()) : null,
    };

    const { error } = await updateBerita(id, payload);
    if (error) {
      return res.render("admin/berita/form", {
        title: "Edit Berita — Admin",
        pageTitle: "Edit Berita",
        layout: "layouts/admin",
        activePage: "berita",
        adminEmail: req.session.admin?.email,
        berita: { ...existing, ...req.body },
        error: "Gagal update: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Berita berhasil diperbarui." };
    res.redirect("/admin/berita");
  } catch (err) { next(err); }
}

/** POST /admin/berita/:id/hapus */
async function hapus(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getBeritaById(id);
    if (existing?.foto_path) await deleteFile(existing.foto_path);
    // video_path tidak lagi diproses — kolom DB dibiarkan apa adanya
    await deleteBerita(id);
    req.session.flash = { type: "success", msg: "Berita berhasil dihapus." };
    res.redirect("/admin/berita");
  } catch (err) { next(err); }
}

module.exports = { index, showCreate, create, showEdit, update, hapus };
