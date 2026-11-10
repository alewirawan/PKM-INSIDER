# Frontend SMP Nurul Huda

Seluruh website publik dan dashboard admin berada di folder ini. Frontend memakai React 19, TypeScript, Vinext, dan Vite.

## Menjalankan dari root workspace

Jalur resmi tim: Docker Desktop aktif dan backend/.env siap, mengikuti
[Panduan Docker](../PANDUAN-INSTALASI.md).
Jika terminal sedang di folder frontend, jalankan `cd ..` dahulu. Root project
harus berisi compose.dev.yaml. Tutorial setup awal dan akun admin ada di
[README utama](../README.md); jangan memasang dependency frontend terpisah di host.

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --wait
```

Website tersedia di `http://localhost:3000` dan dashboard di `http://localhost:3000/admin`.
Gunakan layanan checks pada panduan sebelum menyerahkan perubahan.
Compose mengatur URL API publik untuk browser dan URL internal untuk SSR.
Konfigurasi frontend/.env.local di laptop tidak dimasukkan ke image Docker.

Launcher membaca field `bin` pada package.json tool, sehingga tidak memerlukan
entry point library Vinext untuk menjalankan CLI. Pertahankan resolusi ini saat
mengubah launcher. Tes mencakup dependency di root/workspace, path dengan spasi,
dan paket yang tidak memiliki entry point library. Uji pada Windows tetap
diperlukan saat menyerahkan perubahan yang menyentuh launcher.

## Titik integrasi backend

- `app/lib/api-client.ts`: HTTP client dan konfigurasi base URL.
- `app/lib/cms/posts.ts`: repository API artikel publik dan admin.
- `app/lib/local-cms.ts`: adapter data lokal untuk modul mockup yang belum diintegrasikan.
- `app/school-directory-data.ts`: tipe dan seed struktur organisasi/guru.
- `../contracts/openapi.yaml`: kontrak endpoint yang disarankan.

Peta folder dan aturan penempatan kode baru tersedia di
[`../docs/FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md).

Tanpa backend, dashboard masih dapat dibuka dalam mode demo untuk modul mockup.
Blog, klub, dan agenda memakai data demo lokal jika base URL API belum diatur.
Saat URL API diatur, baca/tulis memakai server dan kegagalan API ditampilkan tanpa
mengganti data dengan contoh. Saat `NEXT_PUBLIC_API_BASE_URL` tersedia,
login memakai `/auth/login` dan session cookie HttpOnly sesuai kontrak OpenAPI.

Penjelasan mode demo di atas hanya berlaku untuk jalur manual npm di luar Docker.
Container development selalu terhubung ke API. Jangan simpan token atau credential di repository.

Pada main per 10 November 2026, client Pengaturan memanggil /settings tetapi
backend endpoint tersebut belum tersedia. Pesan pengaturan gagal dimuat atau
prestasi belum tersedia bukan bukti instalasi Docker gagal. Lihat
[status fitur](../PANDUAN-INSTALASI.md#fitur-yang-belum-selesai).
