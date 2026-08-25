/**
 * public/js/main.js — Client-side JavaScript utama
 *
 * Hanya berisi interaksi UI dasar.
 * Jaga file ini tetap ringan dan sederhana.
 */

"use strict";

// ============================================================
// Mobile Navigation Toggle
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      const isHidden = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", !isHidden);
      // Update aria label untuk aksesibilitas
      menuBtn.setAttribute("aria-label", isHidden ? "Tutup menu" : "Buka menu");
    });
  }
});
