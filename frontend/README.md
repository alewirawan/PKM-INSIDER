# Frontend SMP Nurul Huda

Seluruh website publik dan dashboard admin berada di folder ini. Frontend memakai React 19, TypeScript, Vinext, dan Vite.

## Menjalankan dari root workspace

```bash
npm install
npm run dev
```

Website tersedia di `http://localhost:3000` dan dashboard di `http://localhost:3000/admin`.
Gunakan `npm run check` sebelum menyerahkan perubahan.

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

Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_API_BASE_URL` ketika backend sudah tersedia. Jangan simpan token atau credential di repository.
