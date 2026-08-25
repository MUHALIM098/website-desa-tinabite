# Website Resmi Desa Tinabite

Website profil digital **Desa Tinabite**, Kecamatan Lantari Jaya, Kabupaten Bombana, Sulawesi Tenggara.

Dibuat sebagai program kerja **KKN (Kuliah Kerja Nyata)**.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js + Express.js |
| Template Engine | EJS + express-ejs-layouts |
| CSS Framework | Tailwind CSS |
| Database | Supabase PostgreSQL |
| File Storage | Supabase Storage |
| Deployment | Vercel |

---

## Struktur Project

```
website-desa-tinabite/
├── config/              # Konfigurasi aplikasi (Supabase, constants)
├── controllers/         # Handler request untuk setiap route
├── middleware/          # Middleware Express (error handler, dll)
├── models/              # Data models / query ke database
├── routes/              # Definisi routing (public & admin)
├── services/            # Business logic & integrasi layanan (Storage)
├── views/               # Template EJS
│   ├── layouts/         # Layout utama yang dipakai semua halaman
│   ├── partials/        # Komponen yang bisa dipakai ulang (header, footer)
│   ├── public/          # Halaman-halaman publik
│   └── admin/           # Halaman-halaman panel admin
├── public/              # Static files (CSS, JS, gambar)
│   ├── css/
│   ├── js/
│   └── images/
├── database/            # Schema SQL & migrasi database
├── utils/               # Fungsi utilitas umum
├── .env.example         # Template environment variables
├── .gitignore
├── vercel.json          # Konfigurasi deployment Vercel
├── tailwind.config.js
├── app.js               # Entry point aplikasi
└── package.json
```

---

## Setup Development Lokal

### 1. Clone repository

```bash
git clone https://github.com/username/website-desa-tinabite.git
cd website-desa-tinabite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Kemudian edit file `.env` dan isi dengan credential Supabase Anda.

### 4. Build Tailwind CSS

```bash
npm run build:css
```

### 5. Jalankan server development

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## Environment Variables

Lihat file [`.env.example`](.env.example) untuk daftar lengkap variabel yang dibutuhkan.

**Dapatkan kredensial Supabase dari:**
1. Login ke [supabase.com](https://supabase.com)
2. Buka project Anda
3. Pergi ke **Settings → API**
4. Salin `Project URL`, `anon/public key`, dan `service_role key`

> ⚠️ **JANGAN PERNAH** commit file `.env` ke Git. File ini sudah ada di `.gitignore`.

---

## Deployment ke Vercel

1. Push kode ke GitHub
2. Import repository di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di **Vercel Dashboard → Settings → Environment Variables**
4. Deploy otomatis setiap push ke branch `main`

---

## Halaman yang Direncanakan

### Halaman Publik
- Beranda
- Profil Desa
- Pemerintahan
- Potensi Desa
- UMKM
- Berita & Pengumuman
- Galeri
- Kontak

### Panel Admin
- Login
- Dashboard
- Manajemen Profil Desa
- Statistik Desa
- Perangkat Desa
- Potensi Desa
- UMKM
- Berita
- Galeri
- Kontak & Pesan

---

## Kontributor

Program KKN — Desa Tinabite, Kecamatan Lantari Jaya, Kabupaten Bombana, Sulawesi Tenggara.
