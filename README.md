# SMP Nurul Huda Workspace

Project dipisahkan agar pengembangan frontend dan backend tidak saling mengganggu.

Pertama kali menerima ZIP? Ikuti [Panduan Instalasi](PANDUAN-INSTALASI.md), mulai
dari demo frontend tanpa database, atau baca `MULAI-DISINI.txt` untuk langkah cepat.

Baru mulai mengerjakan project? Baca [Panduan Anggota](docs/PANDUAN-ANGGOTA.md):
latihan pertama untuk 10 anggota, penjelasan API, cara membagi tugas kecil,
dan cara menyerahkan perubahan. Panduan ini tidak memerlukan pemahaman seluruh
backend untuk memulai tugas tampilan.

Panduan pembagian 10 anggota PKM, path file, struktur folder yang direncanakan,
dan urutan pengerjaan tersedia di [Panduan Kerja Tim PKM](docs/README-TIM-PKM.md).
Gunakan revisi 15 Oktober 2026 yang mencakup Prestasi, Ekstrakurikuler, dan berkas
PPDB. Kontrak target integrasi ada di [panduan API](contracts/README.md); endpoint
berstatus planned masih harus dibuat tim. PDF pembagian tugas lama hanya arsip.

```text
project-k/
├── frontend/      # Website publik dan dashboard admin
├── backend/       # Fastify API, PostgreSQL, dan Drizzle ORM
├── contracts/     # Kontrak OpenAPI frontend–backend
├── docs/          # Panduan anggota dan pembagian fitur
├── .github/       # Pemeriksaan otomatis, template tugas, dan template PR
├── artifacts/     # Arsip ZIP dan hasil export lama
└── package.json   # Perintah workspace frontend dan backend
```

## Menjalankan frontend

Dari root project:

```bash
npm ci
npm run dev
```

Gunakan instalasi dari root workspace agar dependency tidak terduplikasi di
`frontend/node_modules`.

- Website publik: `http://localhost:3000`
- Dashboard admin: `http://localhost:3000/admin`

## Status backend

Schema database seluruh scope project sudah tersedia: 23 tabel PostgreSQL,
relasi, constraint, arsip berkas, akun pendaftar, dan migration yang menjaga data
lama. Setelah pull, jalankan `npm run db:migrate --workspace=@nurul-huda/backend`
dan `npm run db:verify --workspace=@nurul-huda/backend` pada database lokal yang
sudah dikonfigurasi. Lihat [diagram database](backend/database.dbml) dan
[panduan schema serta alur data](backend/README.md#schema-seluruh-project).
Tabel siap digunakan tidak berarti seluruh endpoint menu sudah selesai.

Backend foundation sudah tersedia menggunakan Fastify, TypeScript, PostgreSQL,
dan Drizzle ORM. Fondasi ini mencakup schema awal, migration, autentikasi admin,
health check, security middleware, test, serta Docker setup. Panduan detail ada di
[`backend/README.md`](backend/README.md).

Bagian anggota 2 sudah terintegrasi: pengelolaan ekstrakurikuler dan agenda,
daftar publik terfilter, serta penyimpanan PostgreSQL. Jalankan migration
yang tersedia dan konfigurasi URL API untuk memakai penyimpanan server.
Tanpa URL API, mode demo browser tetap tersedia.

Selama endpoint resource belum diintegrasikan, konten publik masih disimpan melalui
`localStorage`, sedangkan data pribadi pendaftar, pesan, dan newsletter hanya
disimpan di `sessionStorage` hingga tab ditutup. Ini adapter mockup, bukan database
production.

Jalankan seluruh quality gate dengan `npm run check` (lint, typecheck, build, dan test).

## Modul struktur dan guru

Menu **Struktur & guru** pada dashboard dapat:

- mengubah profil pimpinan dan guru;
- memindahkan pimpinan antara kepala sekolah, wakil kepala, dan koordinator;
- mengubah urutan tampilan;
- memilih contoh foto;
- menambah atau menghapus profil.

Perubahan lokal langsung terlihat pada halaman publik `/struktur`.

Seluruh nama, data, alamat, foto, dan statistik pada website ini bersifat fiktif.
