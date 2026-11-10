# Kontrak API SMP Nurul Huda

Versi **1.3.0**, PKM-INSIDER. [openapi.yaml](openapi.yaml) mencatat endpoint yang
terpasang pada backend. Base URL lokal: `http://localhost:4000/api/v1`.

## Pemakaian client

Gunakan `frontend/app/lib/api-client.ts`, dengan `credentials: include`.
Docker menyediakan alamat browser dan alamat internal SSR secara otomatis.
Mutasi mengharuskan Origin yang sesuai `FRONTEND_ORIGINS`; browser mengirimnya otomatis.
Server memeriksa sesi dan role, bukan hanya menyembunyikan tombol frontend.

| Modul | Endpoint utama | Akses |
| --- | --- | --- |
| Auth admin | POST /auth/login, POST /auth/logout, GET /auth/session | Akun admin |
| Pengaturan | GET /settings, PUT /settings | Baca publik, tulis super_admin |
| Direktori | GET/PUT /directory | Baca publik, tulis super_admin/editor |
| Artikel | GET/POST /posts; PATCH/DELETE /posts/:id; GET /posts/by-slug/:slug; GET /admin/posts | Publik hanya Terbit; tulis super_admin/editor |
| Agenda | GET/POST /agenda; PATCH/DELETE /agenda/:id; GET /admin/agenda | Publik hanya Publik; tulis super_admin/editor |
| Ekstrakurikuler | GET/POST /clubs; PATCH /clubs/:id; GET /admin/clubs | Publik hanya aktif; tulis super_admin/editor |
| Prestasi | GET/POST /achievements; PATCH/DELETE /achievements/:id; GET /admin/achievements | Publik hanya published; tulis super_admin/editor |
| Pesan | POST/GET /messages; PATCH/DELETE /messages/:id | Kirim publik; baca/kelola super_admin/editor |
| Newsletter | POST /newsletter-subscriptions | Email + consent=true; mencatat persetujuan |
| Dashboard | GET /dashboard/summary | super_admin |
| PPDB publik | POST /applications | Form multipart, Idempotency-Key |
| PPDB admin | GET /applications; POST /applications/offline; GET/PATCH /applications/:number | super_admin/admin_ppdb |
| Dokumen admin | GET /applications/:number/documents; PATCH /applications/:number/documents/:slot; GET .../:slot/download | super_admin/admin_ppdb |
| Upload admin | PUT /applications/:number/documents/by-kind/:kind | Multipart field file; super_admin/admin_ppdb |
| Akses pendaftar | POST /applications/:number/access | super_admin/admin_ppdb, identitas diperiksa panitia |
| Portal | POST /applicant/login, /logout, /activate; GET /applicant/application | Sesi pendaftar sendiri |
| Dokumen portal | PUT /applicant/documents/:kind; GET /applicant/documents/:slot/download | Hanya dokumen milik sesi |

## Pendaftaran dan dokumen

`POST /applications` menerima multipart `data` (teks JSON), serta file bernama
`skl`, `ijazah`, `kk`, `ktp`, `kip`, `akta`. JSON memuat biodata,
`extracurriculars: string[]`, `password` minimal 12 karakter, dan `consent: true`.
Browser menetapkan Content-Type beserta boundary; jangan menulis header multipart sendiri.
Maksimal enam berkas, masing-masing 5 MiB, PDF/JPG/PNG dengan signature sesuai ekstensi dan MIME.

Kirim `Idempotency-Key` UUID. Retry dengan isi sama menghasilkan receipt yang sama;
isi berbeda dengan key sama ditolak 409. Receipt berisi `id`, `status`, `submittedAt`.
Receipt dipertahankan (tidak ada purge otomatis); bukan akses publik ke biodata.
Server menyimpan snapshot `documentRequirements` dan nama kegiatan.
PIP/KIP opsional, kegiatan boleh kosong/lebih dari satu, dan buka/tutup ditentukan toggle.

Offline memakai JSON biodata + `receivedDocumentKinds`, dengan Idempotency-Key.
Pendaftar offline boleh belum memiliki berkas lengkap; akun portal belum aktif sampai aktivasi.

`Application.id` adalah nomor NH-…, berbeda dari UUID internal tabel.
`GET /applications?search=...&status=...&source=...&limit=25&cursor=...` mengembalikan
`{items,nextCursor}`. Urutan terbaru dahulu; cursor harus diteruskan tanpa diubah.
Search mencari nama/NISN/nomor, source Website/Offline. Ekspor UI berlaku halaman aktif.

Dokumen di API memakai `kind`, frontend lama memakai `key`; mapper berada di
`frontend/app/lib/api/applications.ts`. Metadata tidak berisi storageKey atau URL publik.
Review menerima `status`, `reviewNote`, dan opsional `receivedPhysically`.
Status Perlu perbaikan wajib catatan. Verifikasi memerlukan file atau penerimaan fisik.
Upload pengganti memakai field `file`; versi lama disimpan dan status kembali Menunggu pemeriksaan.
Berkas Terverifikasi terkunci sampai admin mengubah status pemeriksaan.

## Sesi dan pemulihan

Cookie admin: `nh_admin_session`; cookie pendaftar: `nh_applicant_session`, path
`/api/v1/applicant`. Keduanya HttpOnly/SameSite=Lax, Secure pada NODE_ENV=production.
Token sesi disimpan sebagai hash; password memakai Argon2.

Pendaftaran online membuat akun dengan password pilihan pendaftar. Login memerlukan
nomor dan password, bukan nomor saja. Endpoint access admin mengembalikan
`{token,expiresInMinutes:30}` setelah panitia memeriksa identitas. Tautan dibawa melalui
fragment `/pendaftar#token=...`, dihapus dari address bar setelah dibaca.
Aktivasi sekali pakai mengubah password dan membatalkan sesi lama. Membuat tautan baru
membatalkan tautan yang belum dipakai. Tidak ada pengiriman email otomatis.

## Struktur implementasi

- `backend/src/modules/`: handler, validasi, service/repository per fitur.
- `backend/src/shared/http/access.ts`: sesi, role dan pemeriksaan Origin.
- `backend/src/modules/documents/`: validasi file, storage privat, versi dan review.
- `backend/src/db/schema/`: 23 tabel, relasi, indeks dan constraint.
- `frontend/app/lib/api/`: DTO/mapper/request per fitur.
- `backend/tests/full-system.test.ts`: alur lintas modul pada PostgreSQL test terpisah.
- `tests/browser/school.spec.ts`: pengujian browser dengan frontend/backend nyata.

Kesalahan validasi 422, tidak login 401, role/Origin ditolak 403, data tidak ditemukan
404, konflik 409, file terlalu besar 413, dan rate limit 429. Pesan error ditampilkan
oleh client; kegagalan API tidak diganti dengan data demo. Tanpa URL API, mode demo
manual tetap tersedia untuk pratinjau saja dan tidak dipakai konfigurasi Docker.
