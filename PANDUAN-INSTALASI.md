# Cara Menjalankan Project SMP Nurul Huda

Panduan diperbarui: 6 November 2026.

Gunakan [panduan tim terkini](docs/README-TIM-PKM.md); PDF lama tetap arsip.
Auth, Blog/Artikel, Ekstrakurikuler, dan Agenda sudah memiliki integrasi API.
Schema database mencakup 23 tabel; modul lainnya dilanjutkan sesuai pembagian tim.

**Untuk pertama kali, ikuti bagian A: demo frontend.** Backend dan database belum
diperlukan hanya untuk melihat website serta mencoba menu admin simulasi.

## Isi paket

```text
smp-nurul-huda/
├── frontend/              source website dan dashboard admin
├── backend/               fondasi API Fastify dan schema database
├── contracts/             rancangan kontrak API
├── docs/README-TIM-PKM.md  pembagian tugas 10 anggota dan path file
├── artifacts/             PDF pembagian tugas tim
├── compose.dev.yaml       PostgreSQL khusus development lokal
├── PANDUAN-INSTALASI.md    dokumen ini
├── package.json           jalankan npm dari folder yang memuat file ini
└── package-lock.json      versi dependency yang dipakai bersama
```

Folder `node_modules`, hasil build, database, dan `.env` tidak disertakan.
Masing-masing anggota menginstal dependency dan membuat konfigurasi lokal sendiri.

## A. Menjalankan demo frontend — mulai dari sini

### 1. Siapkan aplikasi

- Node.js versi 22.13.0 atau lebih baru sesuai persyaratan project; npm sudah
  termasuk dalam instalasi Node.js.
- Editor seperti Visual Studio Code.
- Koneksi internet saat instalasi dependency dan bila tooling perlu mengunduh aset.

Cek melalui terminal:

```bash
node -v
npm -v
```

Jika perintah belum dikenali, pasang Node.js lalu tutup dan buka kembali terminal.

### 2. Ekstrak ZIP dan buka folder yang benar

Ekstrak seluruh ZIP terlebih dahulu. Jangan menjalankan file dari tampilan isi ZIP.
Buka folder hasil ekstrak bernama `smp-nurul-huda` melalui **File → Open Folder**
di VS Code, lalu pilih **Terminal → New Terminal**.

Pastikan folder terminal memuat `package.json`, `frontend`, dan `backend`.
Jika hasil ekstrak menghasilkan folder bertingkat, masuk lagi ke folder tersebut.

macOS/Linux:

```bash
pwd
ls
```

Windows PowerShell:

```powershell
Get-Location
Get-ChildItem
```

Contoh berpindah folder jika diperlukan — sesuaikan dengan lokasi ekstrak:

```text
cd "/lokasi/hasil-ekstrak/smp-nurul-huda"
```

### 3. Instal dependency dari root

```bash
npm ci
```

`npm ci` memakai versi pada `package-lock.json`. Tunggu sampai selesai tanpa error.
Untuk paket ini jangan menginstal terpisah dari folder frontend atau backend.
Jika nanti tim memang mengubah dependency, koordinator memperbarui lockfile lewat
`npm install` dan membagikan perubahannya.

### 4. Jalankan website

```bash
npm run dev
```

Biarkan terminal tersebut tetap terbuka. Buka alamat yang ditampilkan terminal,
biasanya:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

Pada halaman admin, pilih **Masuk ke mode demo**. Tidak ada email/password demo
yang harus dihafalkan.

**Jangan menyalin `frontend/.env.example` untuk tahap demo.** Jika URL backend
diaktifkan, form admin akan mencoba login ke server yang harus sudah berjalan.

### 5. Menghentikan dan menjalankan lagi

Tekan **Ctrl+C** pada terminal untuk menghentikan server. Saat ingin membuka lagi:

```bash
npm run dev
```

Tidak perlu mengulang `npm ci` setiap kali menjalankan. Instal ulang hanya ketika
dependency/lockfile berubah atau instalasi sebelumnya bermasalah.

### Yang bisa dicoba pada demo

Beranda, Tentang, Program, Struktur & Guru, Prestasi, Blog, Kontak, Pendaftaran, serta menu
admin sudah memiliki tampilan. Perubahan masih disimpan dalam browser lokal;
data pendaftar/pesan simulasi tidak menjadi database bersama antaranggota.
Gunakan data fiktif. Menutup tab dapat menghapus data simulasi yang memakai
sessionStorage. Pilihan ekstrakurikuler dan form PPDB empat langkah sudah tersedia;
berkas dummy hanya dipilih/ditinjau lokal, bukan diunggah, dan hilang dari memori
saat refresh. Login demo tidak berarti backend seluruh fitur sudah tersedia.

## B. Menjalankan backend — untuk anggota yang mengerjakan API

Bagian ini opsional untuk membuka frontend. Backend memiliki auth, health,
Blog/Artikel, Ekstrakurikuler, Agenda, dan schema bersama. Mengaktifkan login
backend belum otomatis menyimpan modul PPDB, direktori, pesan, atau pengaturan
yang integrasinya belum selesai.

### 1. Siapkan PostgreSQL

Pilihan panduan ini: Docker Desktop dengan container PostgreSQL 17. Pastikan Docker
Desktop sudah berjalan dan perintah berikut dikenali:

```bash
docker compose version
```

Jika sudah memiliki PostgreSQL lokal, boleh gunakan database development khusus
dan sesuaikan DATABASE_URL. Jangan memakai database production untuk latihan.

### 2. Buat konfigurasi backend

Dari root project, buat file hanya jika belum tersedia. Jika sudah memiliki
`backend/.env`, pertahankan konfigurasi dan password database yang dipakai.

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Buka `backend/.env` di editor. Ganti dua bagian password agar nilainya sama:

```env
POSTGRES_PASSWORD=ganti-password-lokal-unik
DATABASE_URL=postgres://nurul_huda:ganti-password-lokal-unik@127.0.0.1:5432/nurul_huda
```

Contoh di atas adalah placeholder, bukan credential yang sudah dibuat. Gunakan
password lokal sendiri; untuk memudahkan tahap awal gunakan huruf dan angka tanpa
spasi. Karakter khusus dalam URL memerlukan encoding yang benar. Jangan mengirim
`.env` ke grup atau memasukkannya ke Git.

### 3. Jalankan database development

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d
docker compose --env-file backend/.env -f compose.dev.yaml ps
```

Tunggu status PostgreSQL healthy. Database dipublikasikan hanya pada
`127.0.0.1:5432`. Konfigurasi ini terpisah dari rancangan Compose deployment.
Untuk tahap lokal jangan mengganti perintah ini dengan `docker compose up` tanpa
nama file, karena konfigurasi dan cara menjalankannya berbeda.

Password pada volume database ditetapkan saat pertama kali dibuat. Mengubah
POSTGRES_PASSWORD setelah database berisi data tidak otomatis mengganti password
database tersebut. Koordinasikan perubahan credential; jangan menghapus volume
sebagai langkah troubleshooting biasa.

### 4. Buat tabel dan akun admin

Jalankan dari root:

```bash
npm run db:migrate --workspace=@nurul-huda/backend
npm run db:verify --workspace=@nurul-huda/backend
npm run admin:create --workspace=@nurul-huda/backend
```

Script meminta email, nama, role, dan password minimal 12 karakter. Password tidak
ditampilkan saat diketik. Gunakan akun development sendiri. Membuat admin cukup
sekali untuk database yang sama; tidak perlu membuat ulang saat menyalakan server.

Data contoh sekolah, klub, agenda, guru, dan draft artikel dapat ditambahkan
secara opsional ke database development:

```bash
npm run db:seed:demo --workspace=@nurul-huda/backend -- --confirm-demo
```

Seed tidak membuat akun/password atau membuka PPDB otomatis.

### 5. Jalankan API

```bash
npm run dev:backend
```

Biarkan terminal terbuka, lalu periksa:

- `http://localhost:4000/api/v1/health` — proses server hidup.
- `http://localhost:4000/api/v1/ready` — koneksi database siap.

Jika health berhasil tetapi ready berstatus disconnected/HTTP 503, koneksi
PostgreSQL belum berhasil. Health saja bukan bukti migration/login sudah siap.

### 6. Hubungkan login frontend

Buka terminal kedua pada root project. Salin konfigurasi frontend jika
`frontend/.env.local` belum tersedia; jika sudah ada, ubah nilai URL-nya.

macOS/Linux:

```bash
cp frontend/.env.example frontend/.env.local
```

Windows PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Isinya:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Jalankan atau restart frontend:

```bash
npm run dev
```

Buka `http://localhost:3000/admin` dan masuk dengan akun yang dibuat pada langkah 4.
Gunakan `localhost` secara konsisten untuk alamat frontend/API. Jika frontend
berjalan pada port lain, perbarui FRONTEND_ORIGINS di backend/.env lalu restart API.

Untuk kembali ke mode demo, kosongkan NEXT_PUBLIC_API_BASE_URL di .env.local lalu
restart frontend. Blog, klub, dan agenda kembali memakai data demo browser;
data server tetap tersimpan di PostgreSQL.

### Setelah pull berikutnya

Hentikan dev server dengan Ctrl+C terlebih dahulu, lalu jalankan dari root:

```bash
git pull --ff-only
npm ci
```

Untuk mode backend, nyalakan PostgreSQL dan jalankan:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d
npm run db:migrate --workspace=@nurul-huda/backend
npm run db:verify --workspace=@nurul-huda/backend
npm run dev:backend
```

Jalankan `npm run dev` di terminal kedua. Mode demo cukup `npm run dev`.
Tidak perlu menyalin ulang .env, membuat admin ulang, atau menjalankan db:generate.
Jika pernah menjalankan migration Blog `0001_posts`, perintah db:migrate
menangani jalur pemulihan yang dijelaskan di [panduan backend](backend/README.md).
Backup database berisi data nyata terlebih dahulu; jangan hapus tabel/volume
untuk mengatasi konflik migration.

### 7. Menghentikan database

Hentikan server frontend/backend dengan Ctrl+C, lalu bila database tidak digunakan:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
```

Perintah stop mempertahankan data. Jangan menambahkan perintah penghapusan volume.

## C. Pemeriksaan sebelum membagikan perubahan kode

```bash
npm run check
npm run build --workspace=@nurul-huda/backend
```

`check` menjalankan lint, typecheck, dan test. Test frontend juga menjalankan build
frontend. Build backend diperiksa dengan perintah kedua. Tidak perlu menjalankan
perintah deploy untuk menggunakan project secara lokal.

Untuk melihat hasil build frontend secara lokal:

```bash
npm run build --workspace=@nurul-huda/frontend
npm start
```

Ikuti URL yang dicetak terminal; port preview bisa berbeda dari development.
Untuk aktivitas coding sehari-hari cukup `npm run dev`.

## D. Kendala yang sering muncul

| Pesan/gejala                                         | Yang perlu diperiksa                                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ENOENT package.json                                  | Terminal berada pada folder yang salah; cari folder yang berisi package.json root                                              |
| npm/node tidak dikenali                              | Instal Node.js dan buka ulang terminal                                                                                         |
| npm.ps1 cannot be loaded                             | Pada Windows, gunakan terminal Command Prompt di VS Code atau jalankan npm.cmd; tidak perlu mengubah kebijakan keamanan global |
| Dependency install gagal/ECONNRESET                  | Periksa koneksi, proxy, dan pesan error; simpan lockfile, coba npm ci kembali setelah koneksi pulih                            |
| Port 3000 sudah dipakai                              | Buka URL yang dicetak terminal; jika memakai API, sesuaikan FRONTEND_ORIGINS dengan port tersebut                              |
| Form admin meminta email/password padahal ingin demo | NEXT_PUBLIC_API_BASE_URL sudah diaktifkan; kosongkan lalu restart frontend                                                     |
| Cannot find module                                   | Pastikan npm ci selesai dari root dan Node memenuhi persyaratan                                                                |
| docker tidak dikenali/daemon unavailable             | Docker Desktop belum terpasang atau belum berjalan; frontend demo tidak memerlukan Docker                                      |
| Port database 5432 bentrok                           | Ada PostgreSQL lain; gunakan DB development yang sesuai, atau ubah port host di compose.dev.yaml dan DATABASE_URL bersama-sama |
| Backend ready gagal                                  | Periksa container, DATABASE_URL, port, dan kesamaan password                                                                   |
| Login gagal                                          | Periksa migration, akun admin, kesamaan hostname, dan FRONTEND_ORIGINS                                                         |
| Data berbeda antaranggota                            | Data mockup berada di browser masing-masing; tiap database lokal juga terpisah                                                 |
| Ada peringatan audit/deprecation                     | Baca peringatannya; jangan menjalankan npm audit fix --force tanpa review koordinator                                          |

Launcher frontend paket ini tidak lagi memakai sintaks environment khusus Unix.
Namun seluruh kombinasi sistem operasi anggota belum diuji. Jika ada error, kirim
pesan error dan versi Node/npm ke koordinator, tanpa isi `.env` atau data pribadi.

## E. Pembagian tugas dan dokumen

- [Panduan lengkap 10 anggota](docs/README-TIM-PKM.md).
- [Versi PDF panduan tim](artifacts/Panduan-Kerja-Tim-PKM-SMP-Nurul-Huda.pdf).
- [Struktur frontend](docs/FRONTEND_STRUCTURE.md).
- [Panduan backend](backend/README.md).
- [Kontrak API](contracts/openapi.yaml).

Panduan tugas Markdown diperbarui 15 Oktober 2026; PDF tetap versi 25 September 2026. Catatan setup di dokumen ini diperbarui 28 September 2026; gunakan dokumen
ini untuk perintah menjalankan, bukan PDF lama.
Folder fitur baru dalam panduan tugas tetap rencana, bukan klaim telah dibuat.
Arsip source ini untuk pengembangan lokal, belum merupakan paket siap production.
