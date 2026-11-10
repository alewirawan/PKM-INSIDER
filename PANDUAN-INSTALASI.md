# Panduan menjalankan project SMP Nurul Huda

Diperbarui 10 November 2026. Panduan ini untuk development lokal.
Docker Compose menjalankan PostgreSQL, backend, dan frontend bersama.
`compose.dev.yaml` adalah file yang digunakan tim; `compose.yaml` adalah rancangan
deployment terpisah.

## Pilih sesuai kondisi

| Kondisi | Baca |
| --- | --- |
| Baru install Docker | [Buka project](#2-buka-folder-project), lalu lanjutkan langkah berikutnya. |
| Belum install Docker | [Instalasi aplikasi](#1-install-git-dan-docker). |
| Sudah pernah berhasil | [Menjalankan lagi](#menjalankan-lagi-dan-berhenti). |
| Ingin mengambil kode teman | [Pull dan branch](#pull-dan-pekerjaan-pada-branch). |
| Ingin mengirim pekerjaan | [Pemeriksaan dan push](#pemeriksaan-dan-push). |
| Ingin melihat tabel | [Membuka database](#membuka-database). |
| Ada error | [Jika gagal](#jika-gagal). |

## 1. Install Git dan Docker

### Windows

1. Install [Git for Windows](https://git-scm.com/downloads/win).
2. Jika WSL belum terpasang, buka **PowerShell → Run as Administrator**, jalankan
   perintah berikut, lalu restart Windows:

```powershell
wsl --install
```

Jika WSL sudah ada, periksa `wsl --version` dan perbarui dengan `wsl --update`
jika diminta Docker. Rujukan: [panduan WSL Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install).

3. Download dan install [Docker Desktop untuk Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
   Gunakan backend WSL 2 dan Linux containers. Ikuti persyaratan RAM, versi
   Windows, dan virtualisasi pada halaman resmi. Restart jika installer meminta.
4. Buka Docker Desktop dan tunggu engine berjalan. Membuka aplikasi Docker saja
   belum menyalakan project.
5. Untuk perintah project berikutnya, gunakan **Command Prompt (CMD)** biasa.
   Di VS Code: Terminal → New Terminal → pilih profil Command Prompt.
   Jangan menyalin perintah `copy` atau `cd /d` Windows ke Git Bash/macOS.

### macOS

Install [Git](https://git-scm.com/downloads/mac) dan
[Docker Desktop untuk macOS](https://docs.docker.com/desktop/setup/install/mac-install/).
Pilih installer Apple Silicon atau Intel sesuai Mac, lalu buka Docker Desktop.
Tidak perlu WSL. Gunakan Terminal atau terminal VS Code.

### Periksa instalasi

Buka terminal baru setelah instalasi, lalu:

```bash
git --version
docker version
docker compose version
```

Git dan Compose harus menampilkan versi. `docker version` harus menampilkan
bagian Client dan Server tanpa error koneksi. Tidak perlu memasang Node.js,
PostgreSQL, XAMPP, atau pgAdmin secara terpisah.

## 2. Buka folder project

Semua perintah Compose/Git di panduan ini dijalankan dari **root project**:
folder yang berisi `compose.dev.yaml`, `package.json`, `frontend`, dan `backend`.

### Belum punya project

Windows CMD, contoh lokasi di luar OneDrive:

```bat
mkdir C:\PKM
cd /d C:\PKM
git clone https://github.com/alewirawan/PROJECT-PKM-SMP-NURUL-HUDA.git
cd PROJECT-PKM-SMP-NURUL-HUDA
```

Jika C:\PKM sudah ada, lewati `mkdir`.

macOS, contoh lokasi di luar iCloud:

```bash
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/alewirawan/PROJECT-PKM-SMP-NURUL-HUDA.git
cd PROJECT-PKM-SMP-NURUL-HUDA
```

Jika GitHub meminta login atau menolak akses, gunakan akun GitHub yang diundang
ke repository dan terima undangannya. Jangan memasukkan token ke URL clone.

### Sudah punya project

Buka folder project yang sudah ada di VS Code, lalu buka terminal.
Contoh Windows CMD untuk lokasi di atas:

```bat
cd /d "C:\PKM\PROJECT-PKM-SMP-NURUL-HUDA"
```

Sesuaikan path dengan lokasi sendiri. Jangan membuat clone kedua di dalam project.
Periksa `git status`; simpan/commit perubahan sendiri pada branch tugas dahulu.
Jika folder bersih, ambil main terbaru:

```bash
git switch main
git pull --ff-only origin main
```

Jika pull gagal, baca error dan jangan lanjut seolah update berhasil.
Jangan memakai reset/force untuk membuang perubahan.

Cek folder: di Windows jalankan `dir compose.dev.yaml`; di macOS/Linux gunakan
`ls compose.dev.yaml`. Jika file tidak ditemukan, perbaiki lokasi terminal.

## 3. Siapkan backend/.env sekali saja

Jika `backend/.env` sudah ada, gunakan file tersebut. Jangan menimpanya.

Windows CMD, hanya saat file belum ada:

```bat
copy backend\.env.example backend\.env
notepad backend\.env
```

macOS/Linux:

```bash
cp -n backend/.env.example backend/.env
```

Buka file hasil salinan di editor. Pastikan namanya `.env`, bukan `.env.txt`.
Cari baris:

```dotenv
POSTGRES_PASSWORD=change-me
```

Ganti `change-me` dengan password database development sendiri. Untuk memudahkan
penulisan .env, gunakan huruf besar/kecil dan angka, minimal 16 karakter.
Simpan file. Jangan membagikan password atau commit .env.

- Jika volume database sudah pernah dibuat, gunakan password yang digunakan
  pertama kali. Mengubah .env tidak mengubah password database lama.
- Pada jalur Docker, cukup atur POSTGRES_PASSWORD. Entrypoint membentuk
  DATABASE_URL container otomatis; jangan mengganti localhost menjadi nama
  container secara manual dalam file ini.
- Nilai DATABASE_URL pada contoh hanya digunakan saat backend dijalankan manual
  di luar Docker. Jalur tersebut bukan langkah instalasi tim.
- Frontend menerima alamat API otomatis dari Compose. Tidak perlu membuat
  frontend/.env.local atau mengubah file kode untuk koneksi lokal.

Password database berbeda dari password akun admin website yang dibuat nanti.

## 4. Jalankan ketiga layanan

Hentikan dev server lama project dengan Ctrl+C jika masih memakai port 3000/4000.
Pastikan Docker Desktop masih berjalan, kemudian dari root project:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Build pertama membutuhkan internet dan bisa beberapa menit. Docker mengunduh
image serta memasang dependency Linux. Urutan startup:

1. PostgreSQL siap menerima koneksi.
2. Backend menjalankan migration dan memeriksa 23 tabel.
3. API siap, kemudian frontend dijalankan.

Tunggu sampai perintah selesai tanpa error. Jangan membuka terminal kedua untuk
menjalankan `npm install`, `npm ci`, atau `npm run dev` di host.

## 5. Pastikan berhasil

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps
```

Harus ada tiga layanan: `postgres`, `backend`, `frontend`, semuanya
**Up (healthy)**. Jika masih starting, tunggu sebentar lalu periksa kembali.
Jika exited/unhealthy atau perintah sebelumnya gagal, baca [Jika gagal](#jika-gagal).

| Yang dibuka | Alamat |
| --- | --- |
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| Kesiapan API dan koneksi database | http://localhost:4000/api/v1/ready |

Gunakan localhost secara konsisten agar cookie login bekerja.
Tanda healthy mengonfirmasi layanan hidup; integrasi setiap fitur memiliki
[status sendiri](#fitur-yang-belum-selesai).

## 6. Buat akun admin

Jalankan sekali per database lokal:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run admin:create --workspace=@nurul-huda/backend
```

Jawab pertanyaan email, nama, role, password, dan konfirmasi password.
Untuk development dengan semua hak admin, tekan Enter pada pilihan role agar
memakai `super_admin`. Password minimal 12 karakter; karakter tidak ditampilkan
saat diketik. Gunakan terminal interaktif, bukan panel Output VS Code.

Setelah muncul pesan berhasil, login di http://localhost:3000/admin.
Akun ini berbeda dari akun GitHub/Docker dan password PostgreSQL.
Tidak ada akun bawaan. Jangan membuat ulang akun yang sama setiap startup.
Jika email sudah terdaftar, gunakan akun yang sebelumnya dibuat.

## Data contoh opsional

Database baru tidak otomatis memiliki artikel/kegiatan/pendaftar.
Jika ingin contoh lokal:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run db:seed:demo --workspace=@nurul-huda/backend -- --confirm-demo
```

Seed tidak menimpa record lama, tidak membuat akun admin, pendaftar atau dokumen
asli, dan tidak membuka PPDB otomatis. Artikel contoh berupa draft: terbitkan
dari admin agar terlihat publik. Data seed modul yang belum terintegrasi belum
tentu muncul di tampilan.

## Menjalankan lagi dan berhenti

Buka Docker Desktop, buka terminal di root project, lalu:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d --wait
```

Tidak perlu clone, menyalin .env, atau membuat admin ulang.

Untuk berhenti:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
```

Database dan upload memakai named volumes. stop/down tanpa penghapusan volume
tidak menghapus data. Jangan gunakan `down -v` atau volume prune pada database kerja.
Volume database tetap bernama `nurul-huda-local_postgres_dev_data`.
Database PostgreSQL yang sebelumnya dipasang langsung di laptop tidak otomatis
dipindahkan ke Docker.

## Pull dan pekerjaan pada branch

Simpan/commit pekerjaan sendiri di branch tugas dahulu, kemudian cek
`git status`. Jangan reset/discard perubahan untuk memaksa pull.

### Ambil main terbaru

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
git switch main
git pull --ff-only origin main
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --force-recreate --wait
```

--force-recreate memastikan backend menjalankan migration lagi setelah pull.
Migration yang sudah tercatat tidak diulang; volume database lama tetap digunakan.

### Mulai tugas baru atau lanjutkan tugas lama

Untuk tugas baru, buat branch dari main yang baru diperbarui:

```bash
git switch -c tugas/nomor-nama-fitur
```

Ganti nomor-nama-fitur dengan tugas sendiri. Untuk branch tugas yang sudah ada,
jangan jalankan `switch -c` lagi. Setelah memperbarui main, jalankan:

```bash
git switch nama-branch-tugas
git merge main
```

Jika ada konflik, selesaikan bersama pemilik file sebelum melanjutkan.
Setelah berpindah branch atau menyelesaikan merge, jalankan kembali perintah
rebuild/recreate agar kode pada image mengikuti branch aktif.

Edit file di VS Code seperti biasa. Perubahan app/src dibaca melalui bind mount
dan watcher; dependency Windows/macOS tidak dimount ke container.
Setelah mengubah dependency, package-lock.json, konfigurasi, atau migration,
gunakan perintah rebuild/recreate. Jangan mengganti migration yang sudah dibagikan.

## Pemeriksaan dan push

Pastikan sedang di branch tugas, kemudian jalankan pemeriksaan di image terbaru:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml build checks
docker compose --env-file backend/.env -f compose.dev.yaml run --rm checks
```

Jika pemeriksaan berhasil, review perubahan dan kirim file tugas:

```bash
git status
git diff
git add path-file-yang-dikerjakan
git commit -m "Jelaskan perubahan"
git push -u origin nama-branch
```

Ganti path dan nama branch dengan milikmu; jangan salin placeholder tersebut
secara literal. Buat Pull Request di GitHub untuk direview sebelum digabung.
Jika check gagal, perbaiki penyebabnya.

Git dijalankan di laptop. Docker tidak melakukan push kode/image otomatis.
Jangan commit .env, node_modules, upload, data siswa, atau hasil build.
Isi database lokal tidak ikut git push dan tidak tersinkron antaranggota.
Branch protection perlu diatur pemilik repository; panduan tidak mengaktifkannya.

## Membuka database

Sesudah postgres healthy, buka PostgreSQL melalui terminal:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml exec postgres psql -U nurul_huda -d nurul_huda
```

Nama database di atas sesuai konfigurasi default. Jika tim sengaja mengubah
POSTGRES_DB, sesuaikan argumen -d.

Di prompt PostgreSQL:

| Keperluan | Perintah |
| --- | --- |
| Daftar tabel | `\dt` |
| Struktur kolom artikel | `\d posts` |
| Sepuluh judul artikel | `SELECT id, title FROM posts LIMIT 10;` |
| Keluar | `\q` |

SQL seperti SELECT diakhiri titik koma. Hasil 0 rows berarti belum ada data.
Perintah pemeriksaan ini tidak mengubah data.

pgAdmin belum disertakan; http://localhost:5050 belum tersedia. PostgreSQL
berjalan di jaringan internal Docker dan port 5432 tidak dibuka ke laptop.
Akun admin website bukan akun akses langsung database.

## Fitur yang belum selesai

Status pada main per 10 November 2026:

- Auth admin, Blog, Ekstrakurikuler, dan Agenda sudah memakai API.
- Pembaruan Beranda/Tentang/frontend Pengaturan sudah tersedia.
  Client memanggil GET/PUT /api/v1/settings, tetapi backend endpoint tersebut
  belum tersedia. Di mode Docker, pengaturan gagal dimuat/disimpan dan informasi
  status PPDB yang bergantung padanya belum siap. Ini bukan kegagalan instalasi.
- Prestasi di beranda mode API masih menampilkan pesan belum tersedia.
- PPDB, direktori, data siswa, berkas, pesan, dan prestasi belum terintegrasi
  lengkap; sebagian tampilan masih simulasi browser.

Jangan menghapus database atau install ulang Docker untuk mengatasi endpoint
yang belum dibuat. Keberadaan 23 tabel dan status healthy bukan bukti seluruh
alur fitur selesai.

## Jika gagal

Jalankan dari root project:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps -a
docker compose --env-file backend/.env -f compose.dev.yaml logs --tail=80 postgres backend frontend
```

Bagikan pesan error dan log yang relevan setelah menyamarkan data pribadi atau
credential. Jangan kirim .env, password, token, atau output konfigurasi berisi secret.

| Gejala | Langkah |
| --- | --- |
| docker/git tidak dikenal | Pastikan aplikasi sudah dipasang, lalu buka terminal baru. |
| Cannot connect to Docker daemon / error pipe Docker | Buka Docker Desktop dan tunggu engine siap; periksa docker version. |
| WSL/virtualization error | Ikuti petunjuk Docker Desktop; perbarui WSL dan pastikan virtualisasi aktif sesuai panduan resmi. |
| compose.dev.yaml tidak ditemukan | Terminal belum berada di root project. Cek lokasi dengan dir/ls. |
| backend/.env tidak ditemukan / POSTGRES_PASSWORD belum diisi | Ikuti langkah 3; cek bukan .env.txt dan simpan file. |
| Port 3000/4000 sudah dipakai | Hentikan dev server/container lama project; jangan menyalakan npm dev bersamaan. |
| Password database ditolak | Gunakan password volume lama; perubahan .env tidak mengganti password PostgreSQL. Jangan hapus volume. |
| Migration gagal / backend exited | Baca log backend; jangan menghapus migration atau tabel untuk melewati error. |
| npm ci gagal ketika build | Periksa pesan tahap build dan koneksi internet. Instalasi npm berlangsung di Docker. |
| Login gagal | Pastikan akun admin dibuat, backend healthy, dan alamat browser memakai localhost. |
| Password tidak terlihat ketika membuat admin | Normal: input password disembunyikan. Ketik, lalu Enter. |
| Blog kosong | Database belum memiliki artikel terbit; buat artikel atau terbitkan draft seed. |
| Pengaturan 404/gagal dimuat, prestasi belum tersedia | Lihat status fitur di atas; backend modul tersebut belum selesai. |
| Kode/dependency setelah pull belum sesuai | Gunakan up --build -d --force-recreate --wait dari root. |
| git pull ditolak karena perubahan/konflik | Simpan commit pada branch tugas; koordinasikan konflik tanpa reset atau force push. |

Untuk troubleshooting, sertakan OS, perintah yang dijalankan, status layanan,
dan potongan error. Pesan “tidak jalan” saja belum cukup untuk menentukan sebab.
