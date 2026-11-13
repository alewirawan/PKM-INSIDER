# Cara menjalankan project SMP Nurul Huda

Panduan development lokal. Docker menjalankan **website, backend, dan PostgreSQL** sekaligus. Database setiap anggota terpisah.

## A. Khusus Mac yang sudah disiapkan ini

Lokasi project: `/Users/vwxyesa/Project/pkm-insider`.

1. Buka **Docker Desktop** dari Applications, tunggu engine siap.
2. Buka Terminal dan jalankan:

   ```bash
   cd /Users/vwxyesa/Project/pkm-insider
   ./artifacts/2026-11-10-run-local.command
   ```

3. Tunggu sampai startup selesai. Buka:

   - Website: http://localhost:3000
   - Login admin: http://localhost:3000/admin
   - Portal pendaftar: http://localhost:3000/pendaftar

Launcher memakai password database yang sudah ada di Keychain. **Tidak perlu membuat atau mengganti password database**. File launcher hanya ada di Mac ini, tidak ikut GitHub. Akun admin lokal yang sudah dibuat dapat dipakai kembali; datanya tidak hilang ketika Docker ditutup.

Untuk menghentikan project dari Terminal:

```bash
docker stop pkm-insider-local-frontend-1 pkm-insider-local-backend-1 pkm-insider-local-postgres-1
```

Setelah itu pilih **Quit Docker Desktop** melalui menu Docker. PostgreSQL Homebrew tidak diperlukan untuk project ini.

## B. Komputer anggota lain — pertama kali

### 1. Siapkan aplikasi

Install [Git](https://git-scm.com/downloads) dan [Docker Desktop](https://docs.docker.com/desktop/setup/install/). Windows memakai WSL 2 dan Linux containers. Mac pilih installer sesuai Apple Silicon atau Intel. Buka Docker Desktop dan tunggu engine siap.

Cek dari terminal:

```bash
git --version
docker version
docker compose version
```

`docker version` harus menampilkan bagian Client dan Server. Tidak perlu memasang Node.js atau PostgreSQL secara terpisah.

### 2. Ambil source

Simpan di luar OneDrive/iCloud. Contoh lokasi Windows: `C:\PKM`; Mac: folder project sendiri.

```bash
git clone https://github.com/alewirawan/PKM-INSIDER.git
cd PKM-INSIDER
```

Jika sudah punya folder project, buka folder tersebut; jangan clone lagi di dalamnya. Root project harus berisi `frontend`, `backend`, `package.json`, dan `compose.dev.yaml`.

**Perubahan lokal di Mac tidak tersedia lewat clone/pull sebelum sudah di-commit dan di-push.**

### 3. Konfigurasi database — sekali saja

Hanya jika `backend/.env` belum ada:

Windows **CMD**:

```bat
copy backend\.env.example backend\.env
notepad backend\.env
```

macOS/Linux Terminal:

```bash
cp -n backend/.env.example backend/.env
```

Buka file tersebut dengan editor. Isi `POSTGRES_PASSWORD` dengan password database milik sendiri, lalu simpan. Jangan unggah file ini ke GitHub atau grup. Jika database pernah dijalankan, gunakan password sebelumnya. Mengganti isi file tidak mengganti password volume database lama.

### 4. Jalankan ketiga layanan

Dari root project:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Build pertama membutuhkan internet dan bisa beberapa menit. **Tunggu perintah selesai**, lalu cek:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps
```

`postgres`, `backend`, dan `frontend` harus berstatus **Up (healthy)**. Migration dan pengisian awal konten sekolah berjalan otomatis. Tidak perlu `npm install` atau `npm run dev` di laptop.

### 5. Buat akun admin pada database sendiri

```bash
docker compose --env-file backend/.env -f compose.dev.yaml exec backend npm run admin:create --workspace=@nurul-huda/backend
```

Isi pertanyaan email, nama, role, dan password. Gunakan password minimal 12 karakter; input password memang tidak ditampilkan. Akun milik anggota lain tidak otomatis ada di laptopmu. Setelah akun dibuat, buka http://localhost:3000/admin.

## C. Pemakaian berikutnya

| Kebutuhan | Langkah |
| --- | --- |
| Menyalakan lagi | Buka Docker Desktop, masuk root project, jalankan perintah di bawah. |
| Mengubah kode tampilan | Edit file; dev server memperbarui halaman. |
| Mengubah dependency atau mengambil update | Jalankan ulang dengan `--build`. |
| Menghentikan project | Gunakan `stop`, lalu Quit Docker Desktop bila selesai. |

Menyalakan kembali:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d --wait
```

Menghentikan:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
```

Data tetap tersimpan di volume. **Jangan gunakan `down -v`** untuk mengatasi error karena itu menghapus volume database dan berkas.

## D. Setelah pull update teman

Pastikan perubahan sendiri sudah di-commit pada branch tugas. Periksa lebih dahulu:

```bash
git status
```

Jika working tree bersih, ambil update branch yang sedang dikerjakan:

```bash
git pull --ff-only
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Jika ada konflik atau fast-forward ditolak, selesaikan bersama pemilik perubahan. Jangan memakai reset/force push untuk melewatinya. Docker tidak melakukan commit atau push otomatis, dan data PostgreSQL tidak ikut Git.

## E. Jika website tidak bisa dibuka

```bash
docker compose --env-file backend/.env -f compose.dev.yaml ps -a
docker compose --env-file backend/.env -f compose.dev.yaml logs --tail=60 frontend backend postgres
```

- **Docker daemon tidak tersambung:** buka Docker Desktop dahulu.
- **File compose tidak ditemukan:** terminal berada di folder yang salah.
- **Port 3000/4000 terpakai:** hentikan server lama project; jangan jalankan npm dev bersamaan.
- **Paket/modul tidak ditemukan setelah pull:** ulangi startup dengan `--build`, tunggu healthy, lalu reload browser.
- **Password PostgreSQL ditolak:** gunakan password yang dipakai saat volume dibuat; jangan hapus volume.
- **Admin tidak bisa login:** pastikan akun sudah dibuat di database laptop tersebut.

Panduan detail termasuk pgAdmin dan kolaborasi Git ada di [PANDUAN-INSTALASI.md](../PANDUAN-INSTALASI.md). Untuk Mac workspace ini, gunakan bagian A agar tidak tertukar dengan setup komputer baru.
