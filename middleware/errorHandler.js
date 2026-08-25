/**
 * middleware/errorHandler.js — Global Error Handler Middleware
 *
 * Middleware ini menangani semua error yang di-pass via next(error).
 * Harus didaftarkan TERAKHIR di app.js (setelah semua routes).
 */

"use strict";

/**
 * @param {Error} err - Error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  // Log error di server (jangan tampilkan detail error ke user di production)
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`  Route : ${req.method} ${req.originalUrl}`);
  console.error(`  Message: ${err.message}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).render("public/error", {
    title: "Terjadi Kesalahan — Desa Tinabite",
    layout: "layouts/main",
    statusCode,
    message: isDev ? err.message : "Terjadi kesalahan pada server.",
    // Stack trace hanya ditampilkan di mode development
    stack: isDev ? err.stack : null,
  });
}

module.exports = errorHandler;
