/**
 * controllers/adminKondisiController.js — CRUD Kondisi Desa (Admin)
 *
 * Kondisi Desa dibagi 3 kategori:
 *   demografi       → batas_wilayah, luas_wilayah, jumlah_penduduk
 *   keadaan_sosial  → pendidikan, lembaga_pendidikan, kesehatan, keagamaan
 *   keadaan_ekonomi → pertanian, peternakan, perikanan, mata_pencaharian
 */
"use strict";

const {
  KONDISI_MAP, KATEGORI_LABELS,
  getAllKondisiAdmin, getKondisiById,
  createKondisi, updateKondisi, deleteKondisi,
} = require("../models/kondisiModel");

/** GET /admin/kondisi */
async function index(req, res, next) {
  try {
    const semua = await getAllKondisiAdmin();

    // Kelompokkan per kategori
    const grouped = {};
    for (const kat of Object.keys(KONDISI_MAP)) {
      grouped[kat] = semua.filter(d => d.kategori === kat);
    }

    res.render("admin/kondisi/index", {
      title: "Kondisi Desa — Admin",
      pageTitle: "Kondisi Desa",
      layout: "layouts/admin",
      activePage: "kondisi",
      adminEmail: req.session.admin?.email,
      grouped,
      KONDISI_MAP,
      KATEGORI_LABELS,
      flash: req.session.flash || null,
    });
    delete req.session.flash;
  } catch (err) { next(err); }
}

/** GET /admin/kondisi/tambah?kategori=demografi&sub=batas_wilayah */
function showCreate(req, res) {
  const { kategori, sub } = req.query;
  res.render("admin/kondisi/form", {
    title: "Tambah Data Kondisi — Admin",
    pageTitle: "Tambah Data Kondisi",
    layout: "layouts/admin",
    activePage: "kondisi",
    adminEmail: req.session.admin?.email,
    kondisi: { kategori: kategori || "demografi", sub_kategori: sub || "" },
    KONDISI_MAP,
    KATEGORI_LABELS,
    error: null,
  });
}

/** POST /admin/kondisi/tambah */
async function create(req, res, next) {
  try {
    const { kategori, sub_kategori, judul, konten, nilai, satuan, urutan } = req.body;
    if (!kategori || !sub_kategori || !judul) {
      return res.render("admin/kondisi/form", {
        title: "Tambah Data Kondisi — Admin",
        pageTitle: "Tambah Data Kondisi",
        layout: "layouts/admin",
        activePage: "kondisi",
        adminEmail: req.session.admin?.email,
        kondisi: req.body,
        KONDISI_MAP, KATEGORI_LABELS,
        error: "Kategori, sub kategori, dan judul wajib diisi.",
      });
    }

    const { error } = await createKondisi({
      kategori, sub_kategori, judul, konten, nilai, satuan,
      urutan: urutan ? parseInt(urutan) : 0,
    });
    if (error) {
      return res.render("admin/kondisi/form", {
        title: "Tambah Data Kondisi — Admin",
        pageTitle: "Tambah Data Kondisi",
        layout: "layouts/admin",
        activePage: "kondisi",
        adminEmail: req.session.admin?.email,
        kondisi: req.body,
        KONDISI_MAP, KATEGORI_LABELS,
        error: "Gagal menyimpan: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Data kondisi desa berhasil ditambahkan." };
    res.redirect("/admin/kondisi");
  } catch (err) { next(err); }
}

/** GET /admin/kondisi/:id/edit */
async function showEdit(req, res, next) {
  try {
    const kondisi = await getKondisiById(req.params.id);
    if (!kondisi) return res.redirect("/admin/kondisi");
    res.render("admin/kondisi/form", {
      title: "Edit Data Kondisi — Admin",
      pageTitle: "Edit Data Kondisi",
      layout: "layouts/admin",
      activePage: "kondisi",
      adminEmail: req.session.admin?.email,
      kondisi,
      KONDISI_MAP, KATEGORI_LABELS,
      error: null,
    });
  } catch (err) { next(err); }
}

/** POST /admin/kondisi/:id/edit */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { kategori, sub_kategori, judul, konten, nilai, satuan, urutan } = req.body;

    const { error } = await updateKondisi(id, {
      kategori, sub_kategori, judul, konten, nilai, satuan,
      urutan: urutan ? parseInt(urutan) : 0,
    });
    if (error) {
      const kondisi = await getKondisiById(id);
      return res.render("admin/kondisi/form", {
        title: "Edit Data Kondisi — Admin",
        pageTitle: "Edit Data Kondisi",
        layout: "layouts/admin",
        activePage: "kondisi",
        adminEmail: req.session.admin?.email,
        kondisi: { ...(kondisi || {}), ...req.body },
        KONDISI_MAP, KATEGORI_LABELS,
        error: "Gagal update: " + error,
      });
    }
    req.session.flash = { type: "success", msg: "Data kondisi berhasil diperbarui." };
    res.redirect("/admin/kondisi");
  } catch (err) { next(err); }
}

/** POST /admin/kondisi/:id/hapus */
async function hapus(req, res, next) {
  try {
    await deleteKondisi(req.params.id);
    req.session.flash = { type: "success", msg: "Data kondisi berhasil dihapus." };
    res.redirect("/admin/kondisi");
  } catch (err) { next(err); }
}

module.exports = { index, showCreate, create, showEdit, update, hapus };
