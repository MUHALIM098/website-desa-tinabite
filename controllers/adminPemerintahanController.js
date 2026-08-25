/**
 * controllers/adminPemerintahanController.js — CRUD Perangkat Desa (Admin)
 *
 * Mengelola data halaman Pemerintahan Desa (/pemerintahan) di sisi publik.
 * Data bersumber dari tabel perangkat_desa di Supabase.
 */
"use strict";

const {
  getAllPerangkatAdmin,
  getPerangkatById,
  createPerangkat,
  updatePerangkat,
  deletePerangkat,
} = require("../models/perangkatModel");
const { uploadFile, replaceFile, deleteFile } = require("../services/storageService");
const appConfig = require("../config/app");

const FOLDER = appConfig.storage.folders.perangkat;

// ============================================================
// GET /admin/pemerintahan — Daftar seluruh perangkat desa
// ============================================================
async function index(req, res, next) {
  try {
    const daftarPerangkat = await getAllPerangkatAdmin();

    res.render("admin/pemerintahan/index", {
      title: "Manajemen Perangkat Desa — Admin",
      pageTitle: "Pemerintahan Desa",
      layout: "layouts/admin",
      activePage: "pemerintahan",
      adminEmail: req.session.admin?.email,
      daftarPerangkat,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

// ============================================================
// GET /admin/pemerintahan/tambah — Form tambah perangkat
// ============================================================
function showCreate(req, res) {
  res.render("admin/pemerintahan/form", {
    title: "Tambah Perangkat Desa — Admin",
    pageTitle: "Tambah Perangkat Desa",
    layout: "layouts/admin",
    activePage: "pemerintahan",
    adminEmail: req.session.admin?.email,
    perangkat: null,
    error: null,
  });
}

// ============================================================
// POST /admin/pemerintahan/tambah — Simpan perangkat baru
// ============================================================
async function create(req, res, next) {
  try {
    const { nama, jabatan, urutan, aktif, motto, profil, pendidikan, pengalaman } = req.body;

    // Validasi server-side
    if (!nama || !nama.trim()) {
      return res.render("admin/pemerintahan/form", {
        title: "Tambah Perangkat Desa — Admin",
        pageTitle: "Tambah Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: req.body,
        error: "Nama perangkat wajib diisi.",
      });
    }
    if (!jabatan || !jabatan.trim()) {
      return res.render("admin/pemerintahan/form", {
        title: "Tambah Perangkat Desa — Admin",
        pageTitle: "Tambah Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: req.body,
        error: "Jabatan perangkat wajib diisi.",
      });
    }

    let foto_url = null, foto_path = null;
    if (req.file) {
      const hasil = await uploadFile(
        FOLDER,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    }

    const { error } = await createPerangkat({
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      foto_url,
      foto_path,
      urutan: urutan ? parseInt(urutan, 10) : 0,
      aktif: aktif === "1",
      motto: motto ? motto.trim() : null,
      profil: profil ? profil.trim() : null,
      pendidikan: pendidikan ? pendidikan.trim() : null,
      pengalaman: pengalaman ? pengalaman.trim() : null,
    });

    if (error) {
      return res.render("admin/pemerintahan/form", {
        title: "Tambah Perangkat Desa — Admin",
        pageTitle: "Tambah Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: req.body,
        error: "Gagal menyimpan: " + error,
      });
    }

    req.session.flash = { type: "success", msg: "Perangkat desa berhasil ditambahkan." };
    res.redirect("/admin/pemerintahan");
  } catch (err) { next(err); }
}

// ============================================================
// GET /admin/pemerintahan/:id/edit — Form edit perangkat
// ============================================================
async function showEdit(req, res, next) {
  try {
    const perangkat = await getPerangkatById(req.params.id);
    if (!perangkat) {
      req.session.flash = { type: "error", msg: "Data perangkat tidak ditemukan." };
      return res.redirect("/admin/pemerintahan");
    }
    res.render("admin/pemerintahan/form", {
      title: "Edit Perangkat Desa — Admin",
      pageTitle: "Edit Perangkat Desa",
      layout: "layouts/admin",
      activePage: "pemerintahan",
      adminEmail: req.session.admin?.email,
      perangkat,
      error: null,
    });
  } catch (err) { next(err); }
}

// ============================================================
// POST /admin/pemerintahan/:id/edit — Simpan perubahan perangkat
// ============================================================
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nama, jabatan, urutan, aktif, motto, profil, pendidikan, pengalaman, hapus_foto } = req.body;

    // Validasi server-side
    if (!nama || !nama.trim()) {
      const perangkat = await getPerangkatById(id);
      return res.render("admin/pemerintahan/form", {
        title: "Edit Perangkat Desa — Admin",
        pageTitle: "Edit Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: { ...(perangkat || {}), ...req.body },
        error: "Nama perangkat wajib diisi.",
      });
    }
    if (!jabatan || !jabatan.trim()) {
      const perangkat = await getPerangkatById(id);
      return res.render("admin/pemerintahan/form", {
        title: "Edit Perangkat Desa — Admin",
        pageTitle: "Edit Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: { ...(perangkat || {}), ...req.body },
        error: "Jabatan perangkat wajib diisi.",
      });
    }

    const existing = await getPerangkatById(id);
    if (!existing) {
      req.session.flash = { type: "error", msg: "Data perangkat tidak ditemukan." };
      return res.redirect("/admin/pemerintahan");
    }

    // Pertahankan foto lama jika tidak ada file baru
    let foto_url = existing.foto_url;
    let foto_path = existing.foto_path;

    if (req.file) {
      // Ada file baru — ganti foto lama
      const hasil = await replaceFile(
        existing.foto_path,
        FOLDER,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );
      if (!hasil.error) { foto_url = hasil.url; foto_path = hasil.path; }
    } else if (hapus_foto === "1") {
      // Admin centang hapus foto — hapus dari Storage jika ada path-nya
      if (existing.foto_path) {
        await deleteFile(existing.foto_path);
      }
      foto_url = null;
      foto_path = null;
    }

    const { error } = await updatePerangkat(id, {
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      foto_url,
      foto_path,
      urutan: urutan ? parseInt(urutan, 10) : 0,
      aktif: aktif === "1",
      motto: motto ? motto.trim() : null,
      profil: profil ? profil.trim() : null,
      pendidikan: pendidikan ? pendidikan.trim() : null,
      pengalaman: pengalaman ? pengalaman.trim() : null,
    });

    if (error) {
      return res.render("admin/pemerintahan/form", {
        title: "Edit Perangkat Desa — Admin",
        pageTitle: "Edit Perangkat Desa",
        layout: "layouts/admin",
        activePage: "pemerintahan",
        adminEmail: req.session.admin?.email,
        perangkat: { ...existing, ...req.body },
        error: "Gagal update: " + error,
      });
    }

    req.session.flash = { type: "success", msg: "Data perangkat berhasil diperbarui." };
    res.redirect("/admin/pemerintahan");
  } catch (err) { next(err); }
}

// ============================================================
// POST /admin/pemerintahan/:id/hapus — Hapus perangkat
// ============================================================
async function hapus(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getPerangkatById(id);

    // Hapus foto dari Storage jika ada
    if (existing?.foto_path) {
      await deleteFile(existing.foto_path);
    }

    await deletePerangkat(id);
    req.session.flash = { type: "success", msg: "Perangkat desa berhasil dihapus." };
    res.redirect("/admin/pemerintahan");
  } catch (err) { next(err); }
}

// ============================================================
// POST /admin/pemerintahan/:id/toggle — Toggle status aktif
// ============================================================
async function toggleAktif(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getPerangkatById(id);
    if (!existing) {
      req.session.flash = { type: "error", msg: "Data perangkat tidak ditemukan." };
      return res.redirect("/admin/pemerintahan");
    }

    const { error } = await updatePerangkat(id, { aktif: !existing.aktif });
    if (error) {
      req.session.flash = { type: "error", msg: "Gagal mengubah status: " + error };
    } else {
      req.session.flash = {
        type: "success",
        msg: `Perangkat berhasil ${!existing.aktif ? "diaktifkan" : "dinonaktifkan"}.`,
      };
    }
    res.redirect("/admin/pemerintahan");
  } catch (err) { next(err); }
}

module.exports = { index, showCreate, create, showEdit, update, hapus, toggleAktif };
