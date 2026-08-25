/**
 * controllers/adminPotensiController.js — CRUD Potensi Desa (Admin)
 *
 * Kategori yang valid: pertanian | perkebunan | peternakan | wisata
 * Foto bersifat opsional — disimpan di Supabase Storage bucket "Potensi-Desa".
 */
"use strict";

const {
  POTENSI_KATEGORI,
  KATEGORI_VALID,
  getAllPotensiAdmin,
  getPotensiById,
  createPotensi,
  updatePotensi,
  deletePotensi,
} = require("../models/potensiModel");
const {
  uploadFileToBucket,
  replaceFileInBucket,
  deleteFileFromBucket,
} = require("../services/storageService");

// Bucket khusus Potensi Desa — berbeda dari bucket default
const BUCKET_POTENSI = "Potensi-Desa";
// Subfolder di dalam bucket (file disimpan langsung di root bucket, tanpa subfolder)
const FOLDER_POTENSI = "foto";

// ============================================================
// GET /admin/potensi
// ============================================================
async function index(req, res, next) {
  try {
    const semua = await getAllPotensiAdmin();

    // Kelompokkan per kategori
    const grouped = {};
    for (const k of POTENSI_KATEGORI) {
      grouped[k.key] = semua.filter(d => d.kategori === k.key);
    }

    res.render("admin/potensi/index", {
      title: "Potensi Desa — Admin",
      pageTitle: "Potensi Desa",
      layout: "layouts/admin",
      activePage: "potensi",
      adminEmail: req.session.admin?.email,
      grouped,
      POTENSI_KATEGORI,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

// ============================================================
// GET /admin/potensi/tambah
// ============================================================
function showCreate(req, res) {
  res.render("admin/potensi/form", {
    title: "Tambah Potensi — Admin",
    pageTitle: "Tambah Potensi Desa",
    layout: "layouts/admin",
    activePage: "potensi",
    adminEmail: req.session.admin?.email,
    potensi: { kategori: req.query.kategori || "" },
    POTENSI_KATEGORI,
    error: null,
  });
}

// ============================================================
// POST /admin/potensi/tambah
// ============================================================
async function create(req, res, next) {
  try {
    const { kategori, judul, deskripsi } = req.body;

    if (!kategori || !judul || !judul.trim() || !KATEGORI_VALID.includes(kategori)) {
      return res.render("admin/potensi/form", {
        title: "Tambah Potensi — Admin", pageTitle: "Tambah Potensi Desa",
        layout: "layouts/admin", activePage: "potensi",
        adminEmail: req.session.admin?.email,
        potensi: req.body, POTENSI_KATEGORI,
        error: "Kategori dan judul wajib diisi.",
      });
    }

    // Upload foto jika ada — ke bucket "Potensi-Desa"
    let foto_url = null, foto_path = null;
    if (req.file) {
      const hasil = await uploadFileToBucket(
        BUCKET_POTENSI, FOLDER_POTENSI,
        req.file.originalname, req.file.buffer, req.file.mimetype
      );
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    }

    const { error } = await createPotensi({
      kategori,
      judul: judul.trim(),
      deskripsi: deskripsi ? deskripsi.trim() : null,
      foto_url,
      foto_path,
    });

    if (error) {
      return res.render("admin/potensi/form", {
        title: "Tambah Potensi — Admin", pageTitle: "Tambah Potensi Desa",
        layout: "layouts/admin", activePage: "potensi",
        adminEmail: req.session.admin?.email,
        potensi: req.body, POTENSI_KATEGORI,
        error: "Gagal menyimpan: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Potensi desa berhasil ditambahkan." };
    res.redirect("/admin/potensi");
  } catch (err) { next(err); }
}

// ============================================================
// GET /admin/potensi/:id/edit
// ============================================================
async function showEdit(req, res, next) {
  try {
    const potensi = await getPotensiById(req.params.id);
    if (!potensi) {
      req.session.flash = { type: "error", msg: "Data potensi tidak ditemukan." };
      return res.redirect("/admin/potensi");
    }
    res.render("admin/potensi/form", {
      title: "Edit Potensi — Admin", pageTitle: "Edit Potensi Desa",
      layout: "layouts/admin", activePage: "potensi",
      adminEmail: req.session.admin?.email,
      potensi, POTENSI_KATEGORI, error: null,
    });
  } catch (err) { next(err); }
}

// ============================================================
// POST /admin/potensi/:id/edit
// ============================================================
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { kategori, judul, deskripsi, hapus_foto } = req.body;

    if (!kategori || !judul || !judul.trim() || !KATEGORI_VALID.includes(kategori)) {
      const potensi = await getPotensiById(id);
      return res.render("admin/potensi/form", {
        title: "Edit Potensi — Admin", pageTitle: "Edit Potensi Desa",
        layout: "layouts/admin", activePage: "potensi",
        adminEmail: req.session.admin?.email,
        potensi: { ...(potensi || {}), ...req.body }, POTENSI_KATEGORI,
        error: "Kategori dan judul wajib diisi.",
      });
    }

    const existing = await getPotensiById(id);
    if (!existing) {
      req.session.flash = { type: "error", msg: "Data potensi tidak ditemukan." };
      return res.redirect("/admin/potensi");
    }

    let foto_url = existing.foto_url || null;
    let foto_path = existing.foto_path || null;

    if (req.file) {
      // Ganti foto lama dengan yang baru — di bucket "Potensi-Desa"
      const hasil = await replaceFileInBucket(
        BUCKET_POTENSI, existing.foto_path, FOLDER_POTENSI,
        req.file.originalname, req.file.buffer, req.file.mimetype
      );
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    } else if (hapus_foto === "1") {
      // Hapus foto dari bucket "Potensi-Desa"
      if (existing.foto_path) await deleteFileFromBucket(BUCKET_POTENSI, existing.foto_path);
      foto_url = null; foto_path = null;
    }

    const { error } = await updatePotensi(id, {
      kategori,
      judul: judul.trim(),
      deskripsi: deskripsi ? deskripsi.trim() : null,
      foto_url,
      foto_path,
    });

    if (error) {
      return res.render("admin/potensi/form", {
        title: "Edit Potensi — Admin", pageTitle: "Edit Potensi Desa",
        layout: "layouts/admin", activePage: "potensi",
        adminEmail: req.session.admin?.email,
        potensi: { ...existing, ...req.body }, POTENSI_KATEGORI,
        error: "Gagal update: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Potensi berhasil diperbarui." };
    res.redirect("/admin/potensi");
  } catch (err) { next(err); }
}

// ============================================================
// POST /admin/potensi/:id/hapus
// ============================================================
async function hapus(req, res, next) {
  try {
    const existing = await getPotensiById(req.params.id);
    // Hapus foto dari bucket "Potensi-Desa" jika ada
    if (existing?.foto_path) await deleteFileFromBucket(BUCKET_POTENSI, existing.foto_path);
    await deletePotensi(req.params.id);
    req.session.flash = { type: "success", msg: "Potensi berhasil dihapus." };
    res.redirect("/admin/potensi");
  } catch (err) { next(err); }
}

module.exports = { index, showCreate, create, showEdit, update, hapus };
