# Frontend SMP Nurul Huda

Seluruh website publik dan dashboard admin berada di folder ini. Frontend memakai React 19, TypeScript, Vinext, dan Vite.

## Menjalankan dari root workspace

```bash
npm install
npm run dev
```

Website tersedia di `http://localhost:3000` dan dashboard di `http://localhost:3000/admin`.
Gunakan `npm run check` sebelum menyerahkan perubahan.

## Titik integrasi backend

- `app/lib/api-client.ts`: HTTP client dan konfigurasi base URL.
- `app/lib/cms/posts.ts`: repository API artikel publik dan admin.
- `app/lib/local-cms.ts`: adapter data lokal untuk modul mockup yang belum diintegrasikan.
- `app/school-directory-data.ts`: tipe dan seed struktur organisasi/guru.
- `../contracts/openapi.yaml`: kontrak endpoint yang disarankan.

Peta folder dan aturan penempatan kode baru tersedia di
[`../docs/FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md).

Tanpa backend, dashboard masih dapat dibuka dalam mode demo untuk modul mockup.
Modul Blog & Artikel tidak menggunakan localStorage: daftar publik, detail artikel,
dan CRUD dashboard memerlukan backend API. Saat `NEXT_PUBLIC_API_BASE_URL` tersedia,
login memakai `/auth/login` dan session cookie HttpOnly sesuai kontrak OpenAPI.

Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_API_BASE_URL` ketika backend sudah tersedia. Jangan simpan token atau credential di repository.
