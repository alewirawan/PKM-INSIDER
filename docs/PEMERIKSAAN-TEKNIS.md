# Pemeriksaan teknis

## Sebelum menyerahkan perubahan

Jalankan `checks` di image Docker terbaru, seperti panduan instalasi. Pemeriksaan
meliputi lint, TypeScript, build frontend, tes HTML/kontrak client, unit backend,
dan build backend. CI juga menguji PostgreSQL dan browser.

## Database uji terpisah

`backend/tests/full-system.test.ts` hanya aktif jika `FULL_SYSTEM_DATABASE_URL`
diberikan atau RUN_FULL_SYSTEM_TESTS=1 dengan DATABASE_URL tersedia. Database harus
lokal dan namanya berakhiran `_test` atau `_ci`. Tes membuat data sintetis; jangan
mengarahkannya ke database anggota/sekolah. Direktori upload fixture terpisah.

Tes mencakup: role/Origin, pengaturan, direktori dinamis, prestasi draft/publik,
pesan/newsletter, validasi file, idempotensi, privasi berkas, login pendaftar,
koreksi, pemeriksaan, status penerimaan, offline, aktivasi sekali pakai dan pagination.

## Browser

`tests/browser/school.spec.ts` memakai frontend dan API nyata. CI menyiapkan akun
fixture melalui `docker/prepare-browser-test.mjs`, yang menolak database non-test.
Pengujian menelusuri form PPDB → portal → perbaikan → review admin → Diterima,
serta input offline/upload admin, navigasi admin mobile dan halaman publik pada viewport 390 dan 1440 piksel.

Untuk menjalankannya pada stack uji terpisah yang sudah hidup:

```bash
RUN_BROWSER_TESTS=1 npx playwright test
```

Perintah tersebut memerlukan Node dan Chromium Playwright di mesin pengujian;
anggota cukup menggunakan pemeriksaan Docker dan melihat hasil CI untuk workflow lengkap.
`E2E_BASE_URL` dan `E2E_API_URL` dapat mengubah alamat uji. Jangan pakai data asli
karena screenshot kegagalan disimpan sebagai artifact CI. Trace jaringan dinonaktifkan agar cookie/sesi tidak ikut disimpan.

## Versi dependency dan batas validasi

Vinext dipin pada 1.4.4. Upgrade hanya melalui perubahan terpisah yang lulus
build, routing, respons 404 artikel, SSR/sitemap, dan tes browser. Jangan memakai
`npm audit fix --force` tanpa meninjau dampak versi dan lockfile.

Dependency tooling masih dapat memiliki advisory tingkat moderate. Periksa
`npm audit` berkala; hasil build/tes bukan audit keamanan production menyeluruh.
Compose development hanya bind frontend/backend/pgAdmin ke localhost. Deployment
VPS, HTTPS, pengelolaan secret, kebijakan privasi sekolah dan uji restore merupakan
langkah tersendiri sebelum penggunaan publik.

Startup Linux juga harus diuji setelah upgrade: gunakan flag `--host` yang didukung
renderer dan pertahankan `ca-certificates` dalam image slim agar runtime dapat
memverifikasi TLS. Jangan mengatasi error sertifikat dengan mematikan verifikasi.

Tunggu dan baca hasil akhir semua tes yang diwajibkan sebelum commit/push; jangan
menjalankan publikasi bersamaan dengan pemeriksaan terakhir yang belum selesai.
