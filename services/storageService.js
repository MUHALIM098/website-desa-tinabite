/**
 * services/storageService.js — Abstraksi Supabase Storage
 *
 * Menyediakan fungsi-fungsi untuk berinteraksi dengan Supabase Storage.
 * Semua operasi file/gambar harus menggunakan service ini,
 * bukan menulis ke filesystem lokal (tidak kompatibel dengan Vercel).
 *
 * Dua set fungsi:
 *  - uploadFile / replaceFile / deleteFile / getPublicUrl
 *      → pakai bucket default (SUPABASE_STORAGE_BUCKET dari .env)
 *        digunakan oleh: berita, galeri, pemerintahan, profil, dsb.
 *
 *  - uploadFileToBucket / replaceFileToBucket / deleteFileFromBucket / getPublicUrlFromBucket
 *      → bucket ditentukan oleh pemanggil
 *        digunakan oleh: potensi (bucket "Potensi-Desa")
 */

"use strict";

const { supabaseAdmin } = require("../config/supabase");
const appConfig = require("../config/app");

// Bucket default — untuk berita, galeri, pemerintahan, profil, dsb.
const BUCKET = appConfig.storage.bucketName;

// ============================================================
// Fungsi helper internal (bucket sebagai parameter)
// ============================================================

/**
 * Mendapatkan public URL sebuah file dari bucket tertentu.
 * @param {string} bucket
 * @param {string} filePath
 * @returns {string|null}
 */
function _getPublicUrl(bucket, filePath) {
  if (!supabaseAdmin || !filePath) return null;
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

/**
 * Upload file ke bucket tertentu.
 * @param {string} bucket
 * @param {string} folder
 * @param {string} fileName
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<{url:string, path:string}|{error:string}>}
 */
async function _uploadFile(bucket, folder, fileName, fileBuffer, mimeType) {
  if (!supabaseAdmin) return { error: "Supabase belum dikonfigurasi." };

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `${folder}/${Date.now()}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) {
    console.error("[Storage] Upload error (" + bucket + "):", error.message);
    return { error: error.message };
  }

  const url = _getPublicUrl(bucket, data.path);
  return { url, path: data.path };
}

/**
 * Hapus file dari bucket tertentu.
 * @param {string} bucket
 * @param {string} filePath
 * @returns {Promise<{success:boolean}|{error:string}>}
 */
async function _deleteFile(bucket, filePath) {
  if (!supabaseAdmin || !filePath) return { success: true };

  const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
  if (error) {
    console.error("[Storage] Delete error (" + bucket + "):", error.message);
    return { error: error.message };
  }
  return { success: true };
}

// ============================================================
// API publik — bucket DEFAULT (berita, galeri, pemerintahan, dst.)
// ============================================================

function getPublicUrl(filePath) {
  return _getPublicUrl(BUCKET, filePath);
}

async function uploadFile(folder, fileName, fileBuffer, mimeType) {
  return _uploadFile(BUCKET, folder, fileName, fileBuffer, mimeType);
}

async function deleteFile(filePath) {
  return _deleteFile(BUCKET, filePath);
}

async function replaceFile(oldPath, folder, fileName, fileBuffer, mimeType) {
  if (oldPath) await deleteFile(oldPath);
  return uploadFile(folder, fileName, fileBuffer, mimeType);
}

// ============================================================
// API publik — bucket DITENTUKAN PEMANGGIL (untuk potensi, dsb.)
// ============================================================

/**
 * Mendapatkan public URL dari bucket yang ditentukan.
 * @param {string} bucket  - Nama bucket Supabase
 * @param {string} filePath
 * @returns {string|null}
 */
function getPublicUrlFromBucket(bucket, filePath) {
  return _getPublicUrl(bucket, filePath);
}

/**
 * Upload file ke bucket yang ditentukan.
 * @param {string} bucket  - Nama bucket Supabase
 * @param {string} folder
 * @param {string} fileName
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<{url:string, path:string}|{error:string}>}
 */
async function uploadFileToBucket(bucket, folder, fileName, fileBuffer, mimeType) {
  return _uploadFile(bucket, folder, fileName, fileBuffer, mimeType);
}

/**
 * Hapus file dari bucket yang ditentukan.
 * @param {string} bucket  - Nama bucket Supabase
 * @param {string} filePath
 * @returns {Promise<{success:boolean}|{error:string}>}
 */
async function deleteFileFromBucket(bucket, filePath) {
  return _deleteFile(bucket, filePath);
}

/**
 * Ganti file di bucket yang ditentukan.
 * @param {string} bucket  - Nama bucket Supabase
 * @param {string} oldPath
 * @param {string} folder
 * @param {string} fileName
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<{url:string, path:string}|{error:string}>}
 */
async function replaceFileInBucket(bucket, oldPath, folder, fileName, fileBuffer, mimeType) {
  if (oldPath) await deleteFileFromBucket(bucket, oldPath);
  return uploadFileToBucket(bucket, folder, fileName, fileBuffer, mimeType);
}

module.exports = {
  // Bucket default
  getPublicUrl,
  uploadFile,
  deleteFile,
  replaceFile,
  // Bucket ditentukan pemanggil
  getPublicUrlFromBucket,
  uploadFileToBucket,
  deleteFileFromBucket,
  replaceFileInBucket,
};
