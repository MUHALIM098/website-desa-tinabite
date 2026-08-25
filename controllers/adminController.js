/**
 * controllers/adminController.js — Dashboard Admin
 */
"use strict";

const { supabaseAdmin } = require("../config/supabase");

/** GET /admin — Dashboard */
async function dashboard(req, res, next) {
  try {
    let stats = { berita: 0, galeri: 0, perangkat: 0, kontak: 0 };

    if (supabaseAdmin) {
      const [beritaRes, galeriRes, perangkatRes, kontakRes] = await Promise.all([
        supabaseAdmin.from("berita").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("galeri").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("perangkat_desa").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("pesan_kontak").select("id", { count: "exact", head: true }).eq("dibaca", false),
      ]);
      stats.berita = beritaRes.count || 0;
      stats.galeri = galeriRes.count || 0;
      stats.perangkat = perangkatRes.count || 0;
      stats.kontak = kontakRes.count || 0;
    }

    res.render("admin/dashboard", {
      title: "Dashboard — Admin Desa Tinabite",
      pageTitle: "Dashboard",
      layout: "layouts/admin",
      activePage: "dashboard",
      adminEmail: req.session.admin?.email,
      stats,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
