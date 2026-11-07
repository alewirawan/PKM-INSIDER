# Panduan Docker Tim SMP Nurul Huda

Diperbarui 7 November 2026. Jalur resmi kerja tim adalah Docker Compose development:
PostgreSQL, backend, dan frontend berjalan bersama. Node/npm dan PostgreSQL tidak
perlu dipasang di laptop untuk menjalankan jalur ini. Git tetap digunakan di laptop.

## Instalasi pertama

1. Pasang Git dan Docker Desktop. Windows memakai WSL 2 dan Linux containers:
   [panduan Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
   Mac memakai installer sesuai Apple Silicon atau Intel:
   [panduan macOS](https://docs.docker.com/desktop/setup/install/mac-install/).
   Ikuti persyaratan sistem pada halaman resmi dan restart jika diminta installer.
2. Buka Docker Desktop, tunggu engine siap. Periksa `docker version` dan
   `docker compose version` di terminal. Keduanya harus berhasil; gunakan Compose v2 terkini.
3. Clone ke folder biasa di luar OneDrive/iCloud, misalnya C:\PKM.
   Buka root repository, yaitu folder berisi package.json dan compose.dev.yaml.

```bash
git clone https://github.com/alewirawan/PROJECT-PKM-SMP-NURUL-HUDA.git
cd PROJECT-PKM-SMP-NURUL-HUDA
```

4. Jika belum ada, salin backend/.env.example menjadi backend/.env. Di Command Prompt:

```bat
copy backend\.env.example backend\.env
```

Di macOS/Linux gunakan `cp backend/.env.example backend/.env`.
Isi POSTGRES_PASSWORD dengan password development sendiri. Jangan menimpa file
yang sudah ada. Jika memakai volume PostgreSQL lama, gunakan password lamanya.
Compose memakai password tersebut untuk database dan membentuk DATABASE_URL
container secara otomatis; DATABASE_URL manual hanya untuk jalur non-Docker.
File frontend/.env.local tidak perlu dibuat untuk jalur Docker.

5. Hentikan dev server lama yang memakai port 3000/4000 dengan Ctrl+C, lalu:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Build pertama mengunduh image dan memasang dependency di dalam image Linux.
Perintah akan menunggu layanan sehat. PostgreSQL dibuat terlebih dahulu, lalu
backend menjalankan migration dan verifikasi 23 tabel. Jika migration gagal,
backend berhenti dan frontend tidak dinyatakan siap.

Buka website **http://localhost:3000**, admin **http://localhost:3000/admin**.
API tersedia di http://localhost:4000/api/v1; /ready memeriksa koneksi database.
Gunakan localhost secara konsisten agar cookie login bekerja.

## Akun admin dan data contoh

Buat admin sekali per database:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run admin:create --workspace=@nurul-huda/backend
```

Isi email, nama, role, dan password minimal 12 karakter melalui terminal.
Tidak ada akun/password admin bawaan. Setelah itu login di /admin.

Data contoh opsional:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run db:seed:demo --workspace=@nurul-huda/backend -- --confirm-demo
```

Seed tidak menimpa record lama, tidak membuat pendaftar atau dokumen asli,
dan tidak membuka PPDB otomatis. Artikel contoh berupa draft; terbitkan dari admin.

## Memulai dan menghentikan setiap hari

Buka Docker Desktop, kemudian dari root:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d --wait
```

Untuk berhenti:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
```

Data disimpan di named volumes. stop/down tanpa penghapusan volume tidak menghapus
database atau upload. Jangan menjalankan down -v atau volume prune pada database kerja.
Volume database tetap bernama nurul-huda-local_postgres_dev_data seperti konfigurasi
lokal sebelumnya. Database PostgreSQL yang dahulu dipasang langsung di laptop
tidak otomatis dipindahkan ke Docker.

## Pull dan perubahan kode

Sebelum mulai, pastikan perubahan sendiri sudah di-commit pada branch tugas.
Jangan reset/discard perubahan untuk memaksa pull.

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
git switch main
git pull --ff-only
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --force-recreate --wait
```

--force-recreate memastikan backend menjalankan migration lagi setelah pull.
Tabel/data tidak dihapus; migration yang sudah tercatat tidak diulang.
Perubahan app/src terbaca melalui bind mount dan watcher. Setelah mengubah
dependency, package-lock.json, konfigurasi, atau migration, gunakan perintah rebuild
di atas. Dependency milik Windows/macOS tidak dimount ke dalam container.

Buat branch tugas sebelum mengedit:

```bash
git switch -c tugas/nomor-nama-fitur
```

## Pemeriksaan dan push

Jalankan pemeriksaan menggunakan image terbaru:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml build checks
docker compose --env-file backend/.env -f compose.dev.yaml run --rm checks
git status
git add path-file-yang-dikerjakan
git commit -m "Jelaskan perubahan"
git push -u origin nama-branch
```

Ganti path dan nama branch dengan milikmu. Buat Pull Request; rekan mereview sebelum
digabung ke main. Jika check gagal, perbaiki penyebabnya, bukan menonaktifkan test.
Folder Git tetap di laptop; tidak ada git push atau upload image otomatis ketika
menyalakan Docker. Data database lokal tidak ikut git push.

Aturan tim:
- Jalankan dan uji integrasi melalui Docker. Tidak perlu npm ci di Windows.
- Jangan commit .env, node_modules, file upload, data siswa, atau hasil build.
- Pertahankan route/modul anggota lain dan jangan mengganti migration yang sudah dibagikan.
- Perubahan lintas modul atau kontrak harus direview pemilik terkait.
- Data setiap anggota terpisah. Seed menyamakan contoh, bukan menyinkronkan database.
- Branch protection wajib diatur pemilik repository jika ingin GitHub memaksa review/check;
  panduan ini dan file workflow saja tidak mengaktifkan aturan repository tersebut.

## Jika gagal

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps -a
docker compose --env-file backend/.env -f compose.dev.yaml logs --tail=80 backend frontend
```

| Gejala | Langkah |
| --- | --- |
| Docker daemon tidak tersambung | Buka Docker Desktop dan tunggu engine siap. |
| Port 3000/4000 terpakai | Hentikan dev server/container lama milik project. |
| Password database ditolak | Cocokkan password dengan volume lama; jangan hapus volume. |
| Migration gagal | Baca log backend; jangan hapus migration/tabel untuk melewati error. |
| Dependency berubah setelah pull | Rebuild dan recreate sesuai langkah di atas. |
| npm ci di dalam build gagal | Kirim error tahap build; jangan menjalankan npm run dev di host sebagai jalan pintas. |
| Login gagal | Pastikan backend healthy dan admin sudah dibuat; gunakan localhost. |
| Blog kosong | Database baru belum berisi artikel terbit; buat atau terbitkan draft dari admin. |

Konfigurasi ini untuk development lokal. compose.yaml dan backend/Dockerfile adalah
rancangan terpisah untuk deployment dan bukan perintah standar tim.
Auth admin, Blog, Ekstrakurikuler, dan Agenda sudah memakai API. PPDB, direktori,
berkas, pesan, prestasi, dan pengaturan tetap mengikuti status implementasi tim.
Docker tidak otomatis menyelesaikan API yang belum dibuat.
