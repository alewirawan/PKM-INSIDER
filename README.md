# Sistem Informasi SMP Nurul Huda

Panduan langkah demi langkah: [Cara menjalankan project](docs/PANDUAN-MENJALANKAN.md), termasuk Mac yang sudah disiapkan dan komputer anggota baru.

Website informasi sekolah dan dashboard admin. Frontend memakai React/TypeScript,
backend Fastify, dan database PostgreSQL. Jalur development tim memakai Docker.

## Mulai di sini

**Sudah install Docker? Lanjutkan dari langkah 2.** Semua perintah project
dijalankan di folder utama yang berisi `compose.dev.yaml`, `frontend`, dan
`backend`. Jangan menjalankannya dari dalam folder frontend/backend.

| Kondisi kamu | Langkah |
| --- | --- |
| Pertama kali menjalankan | Ikuti langkah 1–6 di bawah. |
| Project sudah pernah berjalan | Buka Docker Desktop, lalu [jalankan lagi](#pemakaian-sehari-hari). |
| Baru mengambil update teman | Ikuti [setelah pull](#setelah-pull-update). |
| Muncul error | Buka [pemecahan masalah](PANDUAN-INSTALASI.md#jika-gagal). |

### 1. Siapkan aplikasi

Pasang Git dan Docker Desktop, lalu buka Docker Desktop sampai engine siap.
Windows menggunakan WSL 2 dan Linux containers. Langkah pemasangannya ada di
[panduan instalasi](PANDUAN-INSTALASI.md#1-install-git-dan-docker).

Tidak perlu memasang Node.js, PostgreSQL, XAMPP, atau pgAdmin untuk menjalankan
project. Docker memasang dependency dan menjalankan ketiga layanan.

### 2. Buka project

Windows: gunakan **Command Prompt (CMD)**; di terminal VS Code pilih profil
**Command Prompt**. Simpan project di luar OneDrive, misalnya `C:\PKM`.

Jika belum punya project, buka terminal di folder tempat menyimpan project:

```bash
git clone https://github.com/alewirawan/PKM-INSIDER.git
cd PKM-INSIDER
```

Jika sudah punya project, buka folder tersebut. Jalankan `git status`; bila ada
perubahan sendiri, commit di branch tugas dahulu. Untuk mengambil versi main:

```bash
git switch main
git pull --ff-only origin main
```

Jangan clone lagi di dalam folder project yang sudah ada.

### 3. Siapkan konfigurasi sekali saja

Hanya jika `backend/.env` belum ada, salin file contoh:

Windows CMD:

```bat
copy backend\.env.example backend\.env
notepad backend\.env
```

macOS/Linux:

```bash
cp -n backend/.env.example backend/.env
```

Buka `backend/.env` dengan editor. Ganti nilai `POSTGRES_PASSWORD=change-me`
dengan password database lokal sendiri, lalu simpan. Jangan menimpa file yang
sudah ada. Jika database pernah dibuat, gunakan password lamanya.

Untuk Docker, cukup atur `POSTGRES_PASSWORD`; alamat database dan API diatur
otomatis oleh container. Tidak perlu membuat `frontend/.env.local`.

### 4. Jalankan project

Hentikan server lama project di terminal lain dengan Ctrl+C jika masih memakai
port 3000/4000, kemudian:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Build pertama memerlukan internet dan bisa beberapa menit. Tunggu sampai perintah
selesai tanpa error, lalu periksa:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps
```

Layanan `postgres`, `backend`, dan `frontend` harus **Up (healthy)**.
Docker menyalakan PostgreSQL, menjalankan migration 23 tabel, lalu backend dan
frontend. Tidak perlu menjalankan `npm install` atau `npm run dev` di laptop.

### 5. Buat akun admin sekali saja

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run admin:create --workspace=@nurul-huda/backend
```

Isi email, nama, role, dan password minimal 12 karakter. Untuk admin development
dengan semua hak akses, tekan Enter pada pilihan role untuk memakai `super_admin`.
Password tidak tampil saat diketik. Tidak ada akun admin bawaan; gunakan akun
yang kamu buat, bukan akun GitHub atau akun Docker.

### 6. Buka website

- Website: http://localhost:3000
- Login admin: http://localhost:3000/admin
- Portal pendaftar: http://localhost:3000/pendaftar
- Cek koneksi backend–database: http://localhost:4000/api/v1/ready

Gunakan alamat `localhost` secara konsisten. Docker mengisi profil sekolah,
16 guru, tujuh ekstrakurikuler, dan artikel 17 Agustus saat inisialisasi pertama.
Lihat [panduan konten sekolah](docs/KONTEN-SEKOLAH.md) untuk lokasi sumber dan cara mengubahnya.

## Pemakaian sehari-hari

Buka Docker Desktop dan terminal di folder project. Untuk menjalankan lagi:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d --wait
```

Untuk berhenti:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
```

Data tetap tersimpan. Jangan menggunakan `down -v` atau menghapus volume database.

## Setelah pull update

Simpan/commit pekerjaan sendiri di branch tugas terlebih dahulu. Jalankan dari root:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
git switch main
git pull --ff-only origin main
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --force-recreate --wait
```

Perintah terakhir memperbarui image/container dan menjalankan migration yang belum
diterapkan. Akun admin dan database lama tetap dipakai; jangan ulangi penyalinan
.env atau membuat akun yang sama. Untuk melanjutkan branch tugas yang sudah ada,
ikuti [alur Git pada panduan lengkap](PANDUAN-INSTALASI.md#pull-dan-pekerjaan-pada-branch).

## Fitur yang tersedia

| Bagian | Alur |
| --- | --- |
| Website publik | Beranda, Tentang, Struktur & Guru, Program, Prestasi, Blog, Kontak, PPDB dan Portal Pendaftar. |
| Admin | Login akun PostgreSQL, sesi cookie HttpOnly, hak akses super_admin/editor/admin_ppdb. |
| Konten | Kelola artikel, agenda, ekstrakurikuler, prestasi, guru, dan struktur organisasi. |
| PPDB | Pendaftaran online dengan enam jenis berkas; input offline, pencarian, detail, ekspor halaman, dan verifikasi. |
| Portal pendaftar | Login nomor pendaftaran + password, pantau status, unduh berkas sendiri, dan kirim perbaikan. |
| Pengaturan | Profil, kontak, periode manual, persyaratan berkas dan buka/tutup PPDB. PIP/KIP selalu opsional. |
| Pesan & dashboard | Pesan kontak, pencatatan subscriber, ringkasan pendaftaran dan berkas dari database. |
| Database | PostgreSQL 17, 23 tabel, migration otomatis, upload privat persisten; pgAdmin web opsional. |

Tidak ada admin atau pendaftar bawaan. Konten sekolah dimuat sekali; perubahan admin
tidak ditimpa saat restart. Data simulasi terpisah hanya dimuat jika diminta melalui seed demo.
PPDB awalnya ditutup: buka melalui **Pengaturan** setelah persyaratan diperiksa.
Panduan penggunaan setiap menu ada di [alur sistem](docs/ALUR-SISTEM.md).

Repository ini salinan terpisah dari project tim. Branch
`backup/2026-11-10-original` menyimpan kondisi awal. Volume database memakai
nama `pkm-insider-local`, sehingga tidak memakai database project lama.
Jangan menyalakan keduanya bersamaan pada port 3000/4000.

## Struktur dan panduan lanjutan

```text
frontend/          Website publik dan dashboard admin
backend/           API Fastify, schema PostgreSQL, dan migration
contracts/         Kontrak API antarmodul
docker/            Image dan startup development
compose.dev.yaml   Menjalankan frontend, backend, dan database lokal
docs/              Panduan kerja anggota
```

- [Panduan instalasi lengkap, database, error, dan push](PANDUAN-INSTALASI.md)
- [Panduan mulai bekerja](docs/PANDUAN-ANGGOTA.md)
- [Pembagian tugas 10 anggota](docs/README-TIM-PKM.md)
- [Kontrak API](contracts/README.md)
- [Dokumentasi backend](backend/README.md) dan [diagram database](backend/database.dbml)
- [Dokumentasi frontend](frontend/README.md)

Gunakan data fiktif untuk development. PDF/ZIP lama merupakan arsip; gunakan
panduan pada branch main untuk perintah terbaru.
