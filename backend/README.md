# Backend SMP Nurul Huda

Backend dasar menggunakan Fastify, TypeScript, PostgreSQL, dan Drizzle ORM. Target
deployment adalah satu VPS untuk satu sekolah.

Jalur resmi development tim menggunakan [Panduan Docker](../PANDUAN-INSTALASI.md).
compose.dev.yaml sekarang menjalankan PostgreSQL, backend, dan frontend bersama.
Backend otomatis menjalankan migration dan db:verify saat container dimulai;
perintah npm pada dokumentasi teknis ini dijalankan melalui layanan backend,
misalnya `docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run db:verify --workspace=@nurul-huda/backend`.

## Schema seluruh project

### Perbaikan integrasi 6 November 2026

Blog, klub, dan agenda aktif bersamaan. Pada jalur Docker, migration dan db:verify
dijalankan otomatis saat backend dimulai. Ikuti bagian setelah pull di bawah.
Jangan mengganti journal atau menjalankan `0001_posts.sql` secara manual.
Migration resmi tetap 0000 → 0001_many_colossus → 0002_chunky_scalphunter.

Perintah migration juga mengenali database yang sempat memakai journal Blog
0000 → 0001_posts. Dalam satu transaksi, tabel artikel lama dipertahankan di
`migration_recovery.posts`, schema bersama dipasang, kemudian artikel disalin
ke tabel aktif dengan ID, isi, status, dan tanggal yang sama. Data pendaftaran
dan berkas tetap melalui upgrade arsip yang sudah tersedia. Jika data tidak
memenuhi constraint atau riwayatnya berbeda, transaksi dibatalkan untuk diperiksa.
Backup database tetap diperlukan sebelum migration pada database berisi data nyata.
Schema `migration_recovery` tidak dihapus otomatis dan tidak digunakan aplikasi.
File `0001_posts.sql` dipertahankan hanya untuk mengenali riwayat tersebut.

Untuk menghindari pengulangan konflik, pull sebelum mengerjakan file bersama,
pertahankan route yang sudah terdaftar, dan tambahkan migration baru tanpa
mengganti journal/snapshot yang sudah dibagikan. Jalankan seluruh `npm run check`,
termasuk tes modul anggota lain yang masih tersedia.

API Blog tersedia untuk daftar publik, detail slug, daftar admin, tambah, edit,
dan hapus. Mutasi memakai role super_admin/editor serta Origin yang diizinkan.
`publishedAt` dikirim sebagai ISO datetime; isi artikel memakai array paragraf
yang disimpan sebagai JSONB. Draft lama tanpa publishedAt ditampilkan dengan
tanggal pencatatan sampai editor menentukan tanggal publikasinya.

Database tetap PostgreSQL 17 sesuai Compose project, dengan Drizzle sebagai
definisi tabel dan migration SQL sebagai riwayat perubahan. Schema mencakup
23 tabel untuk seluruh fitur yang saat ini direncanakan. Tidak ada tabel kelas,
nilai, absensi siswa, atau pembayaran karena modul tersebut belum termasuk scope.

Relasi data memakai foreign key, unique index, check constraint, dan transaksi.
Snapshot kebijakan berkas dan paragraf artikel memakai JSONB tervalidasi;
biodata, relasi, status, dan pencarian tetap menggunakan kolom/tabel terstruktur.
Dasar fitur database: [constraint PostgreSQL](https://www.postgresql.org/docs/17/ddl-constraints.html)
dan [JSONB PostgreSQL](https://www.postgresql.org/docs/17/datatype-json.html).

- Definisi TypeScript: `src/db/schema/`.
- Diagram seluruh kolom dan relasi: [database.dbml](database.dbml), dapat dibuka dengan pembaca DBML.
- Migration tambahan: `drizzle/0002_chunky_scalphunter.sql`.
- Export pusat untuk anggota tim: `src/db/schema/index.ts`.
- `admissions.ts` tetap menjadi export kompatibilitas; tabelnya dipisah ke `applications.ts` dan `documents.ts`, bukan dibuat ulang.

DBML adalah diagram, bukan pengganti migration. Partial index, default SQL,
validator JSONB, dan trigger arsip harus dipasang melalui `db:migrate`.
Jangan menjalankan SQL hasil konversi diagram atau `drizzle-kit push` sebagai
pengganti migration yang sudah direview.

### Setelah anggota melakukan pull

Dari root repository, setelah pekerjaan sendiri di-commit pada branch tugas,
Docker Desktop aktif, dan backend/.env sudah tersedia:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml stop
git switch main
git pull --ff-only origin main
docker compose --env-file backend/.env -f compose.dev.yaml up --build -d --force-recreate --wait
```

Untuk komputer baru, ikuti [panduan instalasi](../PANDUAN-INSTALASI.md).
Compose menyalakan database; migration membuat tabel; akun admin dibuat terpisah
melalui perintah interaktif pada panduan tersebut. Jangan menimpa `.env`.

Data contoh bersifat opsional dan hanya untuk database development lokal:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml run --rm backend npm run db:seed:demo --workspace=@nurul-huda/backend -- --confirm-demo
```

Seed menambahkan profil contoh, periode, klub, agenda, guru/struktur, draft artikel,
dan draft prestasi. Seed dapat diulang tanpa memperbarui record yang sudah ada.
Tidak ada akun/password bawaan, dokumen siswa, pendaftar, pesan, atau persetujuan
newsletter yang dibuat otomatis. Pengaturan baru membiarkan PPDB tertutup dan
syarat berkas kosong sampai admin menentukan kebijakan; profil contoh bukan
identitas kontak resmi sekolah. Seed ditolak jika NODE_ENV=production.

### Tabel dan pembagian penggunaannya

| Modul dan anggota | Tabel | Kegunaan utama |
| --- | --- | --- |
| Auth admin, 9 | admins, admin_sessions | Akun admin, role, hash password, hash session, kedaluwarsa |
| Pengaturan, 1 dan 9 | admission_periods, school_settings | Tahun ajaran, satu profil sekolah, toggle manual PPDB, jadwal informasi, syarat berkas |
| Program, 2 | clubs, agenda | Kegiatan aktif/nonaktif dan agenda Publik/Internal |
| Direktori, 3 | teachers, school_leaders | Profil, urutan, tingkat organisasi, indeks foto contoh; maksimal satu kepala sekolah |
| Artikel, 4 | posts | Slug unik, paragraf, author tampilan, draft/terbit dan waktu publikasi |
| Pendaftaran, 5 dan 6 | applications | Satu sumber biodata online/offline, nomor pendaftaran, status, snapshot syarat, periode |
| Pilihan kegiatan, 5 dan 6 | application_choices | Banyak pilihan opsional, nama historis tetap tersimpan saat klub diubah |
| Keputusan PPDB, 5 dan 6 | application_status_history | Riwayat transisi, alasan, admin dan waktu; append-only |
| Submit berulang, 5 | submission_requests | UUID idempotency, hash payload, status proses dan receipt minimal |
| Berkas, 7 | application_document_slots | Satu slot per jenis per pendaftar, penerimaan fisik dan review saat ini |
| Arsip berkas, 7 | application_documents | Metadata setiap versi file; versi lama tidak ditimpa/dihapus |
| Riwayat review, 7 | document_reviews | Hasil pemeriksaan versi tertentu atau berkas fisik; append-only |
| Pesan dan prestasi, 8 | contact_messages, achievements | Pesan privat dan statusnya; prestasi draft/terbit |
| Newsletter, 8 tahap lanjutan | newsletter_subscriptions | Email unik, waktu persetujuan, berhenti berlangganan; belum mengirim email |
| Akses pendaftar, 9 | applicant_accounts, applicant_sessions, applicant_access_tokens | Satu akun per pendaftaran, sesi terpisah, token aktivasi/pemulihan yang di-hash |
| Audit bersama, 9 dan 10 | audit_events | Aktor, tindakan, resource ID dan request ID; tidak menyalin biodata, password, token mentah atau berkas |

Dashboard membaca agregasi dari tabel sumber; tidak ada tabel dashboard duplikat.
Narasi Beranda/Tentang/Program yang belum memiliki editor tetap berada di frontend.
Guru dan pemegang jabatan boleh berdiri sendiri; `school_leaders.teacherId` opsional.
Jika digunakan, nama pada profil jabatan adalah profil tampilan terpisah, bukan
sinkron otomatis dengan nama guru. Simpan `sortOrder` mengikuti urutan array API.
Foto memakai `portraitIndex` 0–7 sesuai kontrak, bukan endpoint upload baru.

### Alur data PPDB

1. Baca school_settings di server dan periksa registrationOpen untuk jalur publik.
   Input offline mengikuti otorisasi admin, bukan toggle publik.
2. Buat applications dengan academicYear dan salinan documentRequirements saat
   diterima. Field baru wajib mengikuti schema_version=2; program tidak dipakai
   lagi. Nomor pendaftaran NH-... dihasilkan database jika tidak diberikan service.
3. Simpan setiap kegiatan ke application_choices menggunakan nameSnapshot.
   Nol pilihan berarti tidak membuat baris pilihan. clubId membantu relasi, tetapi
   tidak menggantikan nama snapshot. Validasi kegiatan aktif di service.
4. Buat slot berkas yang diperlukan. Slot kosong: status=missing, tanpa versi aktif
   dan receivedPhysically=false. Berkas fisik tanpa file digital tetap bisa dicatat.
5. Untuk upload, simpan file privat lalu insert application_documents dan hubungkan
   currentVersionId pada slot dalam transaksi. Penggantian membuat row versi baru,
   status=pending, reviewNote/reviewedBy/reviewedAt dikosongkan. Composite foreign
   key mencegah memasang versi file milik slot atau pendaftar lain.
6. Pemeriksaan menulis document_reviews sekaligus memperbarui slot dalam transaksi.
   Status needs_correction memerlukan catatan. Review dokumen tidak otomatis
   mengubah keputusan penerimaan di applications.
7. Perubahan keputusan menulis application_status_history dalam transaksi yang
   sama dengan update status. Validasi transisi dan role tetap tugas service 5/6/9.

Database tidak menyimpan isi PDF/JPG/PNG; storageKey menunjuk penyimpanan privat.
hasFile pada API diturunkan dari versi aktif, bukan kolom boolean yang diedit bebas.
Keberadaan file di disk, signature file, batas keseluruhan multipart dan hak
download tetap harus diperiksa layanan 7. `documentType`, `status`, `verifiedAt`
dan `verifiedBy` pada application_documents mempertahankan metadata lama;
review terkini menggunakan slot dan document_reviews.

Status database lama dipertahankan agar tidak merusak data yang sudah ada:

| Data | Nilai database | Nilai API |
| --- | --- | --- |
| Sumber | website / offline | Website / Offline |
| Status pendaftaran | verification / verified / interview / accepted / rejected | Verifikasi / Terverifikasi / Wawancara / Diterima / Ditolak |
| Review slot | missing / pending / verified / needs_correction | Belum ada / Menunggu pemeriksaan / Terverifikasi / Perlu perbaikan |
| ID pendaftar | applications.id = UUID internal | applications.registrationNumber = nomor NH-... |
| Tanggal lahir | date | string YYYY-MM-DD |
| Waktu kejadian | timestamp with time zone | string ISO 8601 |

Mapper API harus memilih field sesuai kontrak; jangan langsung mengirim seluruh
hasil SELECT terutama hash akun, storageKey, schemaVersion atau identitas
pemeriksa pada respons pendaftar. Lebar kolom legacy lebih longgar daripada API;
validasi API tetap mengikuti contracts/openapi.yaml.

### Perlindungan arsip dan data lama

Migration tidak drop tabel atau kolom lama, tidak menghapus pendaftaran/file,
dan tidak mengubah program lama menjadi ekstrakurikuler secara tebakan.
Record lama diberi schema_version=1; academicYear dan documentRequirements tetap
null jika belum diketahui. Lengkapi secara eksplisit kemudian naikkan ke versi 2
sebelum memperlakukannya sebagai pendaftaran sesuai kontrak baru. Jangan membuka
akses koreksi berdasarkan data legacy yang belum dipastikan pemiliknya.

File lama dikelompokkan menurut pendaftar dan jenis. Semua row dan storageKey
dipertahankan; versi terbaru menurut uploadedAt lalu id dijadikan versi aktif.
Jenis photo lama tetap dapat dibaca; insert upload photo baru ditolak. Jika jenis
berkas lama tidak dikenal, migration gagal dan rollback tanpa membuang data.
Petakan jenis tersebut setelah pemeriksaan, kemudian jalankan ulang migration.
Status rejected lama dipetakan ke needs_correction dengan catatan penanda legacy,
bukan catatan pemeriksaan baru. Ukuran/format file legacy tidak dianggap otomatis
memenuhi kebijakan upload baru.

Trigger menjaga identitas pencatatan, snapshot syarat/periode, metadata file,
dan riwayat append-only. Data lama tidak boleh dihapus untuk memaksa migration
berhasil. Nonaktifkan akun melalui active/disabledAt, bukan menghapus aktor audit.
Kolom updatedAt menggunakan default dan hook update Drizzle; query SQL manual
harus mengisi updatedAt sendiri. Record arsip tetap membutuhkan backup dan uji restore.

### Batas implementasi dan pengujian

Tersedianya tabel tidak membuat API menu lain otomatis berjalan. Auth admin,
health, klub, agenda dan artikel sudah memiliki handler. Handler PPDB, direktori,
pesan, prestasi, pengaturan, akun pendaftar dan dashboard tetap dilanjutkan anggota
pemiliknya. Alur aktivasi/pemulihan akun pendaftar masih harus disepakati;
tabel token tidak mengaktifkan pengiriman email atau pemulihan otomatis.

Schema menjamin bentuk dan relasi data, bukan seluruh workflow: izin akses,
perubahan status yang sah, batas jumlah guru/struktur, email valid, tanggal lahir
tidak di masa depan, kebijakan retensi operasional, pemilihan image sesuai kontrak,
atomic consumption token, locking idempotency dan cleanup file gagal tetap di service.
Idempotency memakai masa berlaku 24 jam dari service; receipt hanya berisi nomor,
status dan waktu. Jangan memasukkan biodata ke receipt atau audit.

Tes schema menggunakan database khusus, tidak database kerja:

```bash
SCHEMA_TEST_DATABASE_URL=postgres://USER@127.0.0.1:PORT/nh_schema_test npm run test --workspace=@nurul-huda/backend
SCHEMA_UPGRADE_DATABASE_URL=postgres://USER@127.0.0.1:PORT/nh_schema_upgrade_test npm run test --workspace=@nurul-huda/backend
```

Database tes upgrade harus kosong; tes menyiapkan schema lama dan data fiktif,
kemudian membuktikan upgrade/rollback. Tidak ada penghapusan otomatis database.
Tes schema biasa dapat diulang; tanpa kedua variabel ini tes tersebut dilewati.
`db:verify` memeriksa tabel, kolom dan helper migration, bukan membuktikan bahwa
seluruh constraint, konfigurasi security, atau workflow production sudah benar.

Setelah perubahan schema berikutnya, gunakan db:generate dan review SQL,
terutama bila menyentuh data lama. Jangan mengedit migration yang sudah di-pull
dan dijalankan tim; buat migration baru. Cetak ulang sumber diagram dengan
`npm run db:diagram --workspace=@nurul-huda/backend` bila struktur berubah.

## Isi fondasi saat ini

- konfigurasi environment tervalidasi;
- PostgreSQL client dan schema Drizzle;
- 23 tabel lintas modul dengan relasi dan constraint sesuai daftar di atas;
- migration SQL versioned, termasuk upgrade arsip PPDB lama;
- autentikasi admin berbasis cookie session;
- rate limit login dan global request;
- CORS allowlist, Helmet, multipart limit, dan error envelope konsisten;
- endpoint health dan readiness;
- test untuk health, 404, dan validasi login;
- Dockerfile dan Compose PostgreSQL.
- modul ekstrakurikuler (tambah, edit, nonaktif) dan agenda (tambah, edit, hapus);
- daftar publik terfilter, izin super_admin/editor, serta pemeriksaan Origin untuk mutasi konten;
- migration `0001_many_colossus.sql` untuk tabel klub dan agenda.

CRUD pendaftar, dokumen, direktori, artikel, pesan, dan settings berikutnya
dibuat per modul dengan mengikuti `../contracts/openapi.yaml`.

## Ekstrakurikuler dan agenda

Jalankan migration yang sudah tersedia sebelum memakai modul ini. Tabel baru
awalnya kosong; tambahkan konten lewat admin, bukan mengimpor data demo otomatis.

| Endpoint (prefix /api/v1) | Akses |
| --- | --- |
| GET /clubs | Publik; hanya kegiatan aktif |
| GET /admin/clubs | super_admin/editor; termasuk nonaktif |
| POST /clubs, PATCH /clubs/:clubId | super_admin/editor |
| GET /agenda | Publik; hanya visibility=Publik |
| GET /admin/agenda | super_admin/editor; termasuk internal |
| POST /agenda, PATCH /agenda/:agendaId, DELETE /agenda/:agendaId | super_admin/editor |

PATCH klub menerima sebagian field. PATCH agenda mengirim seluruh AgendaInput.
Mutasi harus membawa cookie session dan header Origin yang cocok dengan
FRONTEND_ORIGINS. Browser mengirim Origin otomatis. Klien CLI harus mengirimkannya
secara eksplisit. Role admin_ppdb tidak boleh mengelola konten ini.

Di frontend, atur NEXT_PUBLIC_API_BASE_URL ke alamat API dengan prefix /api/v1,
lalu restart dev server. Gunakan hostname konsisten untuk frontend/backend
(misalnya localhost untuk keduanya) agar cookie same-site bekerja. Tanpa URL API,
kedua modul berjalan sebagai demo browser. Dalam mode API, kegagalan tidak diganti
dengan data demo. Modul lain masih mengikuti status implementasi masing-masing.

Konfigurasi CSP frontend saat ini mengizinkan API HTTP lokal hanya melalui
http://localhost:4000. Gunakan alamat ini untuk pengujian browser; port HTTP
lain memerlukan penyesuaian CSP yang direview bersama anggota 10. Daftarkan
origin frontend yang persis sama pada FRONTEND_ORIGINS backend.
Setelah menambahkan metode HTTP baru, uji OPTIONS/preflight dan aksi browser,
bukan hanya app.inject; CORS harus mengizinkan PATCH/DELETE untuk edit/hapus.

Tes PostgreSQL opsional hanya boleh memakai database lokal terpisah bernama
team2_test (atau team2_test_suffix). Jangan arahkan ke database kerja/produksi.
Tes menjalankan migration dan menambahkan data fiktif:

```bash
TEST_DATABASE_URL=postgres://USER@127.0.0.1:PORT/team2_test npm run test --workspace=@nurul-huda/backend
```

Tanpa TEST_DATABASE_URL, unit/API tests tetap berjalan dan tes database dilewati.

## Struktur

```text
backend/
├── src/
│   ├── config/             # environment
│   ├── db/
│   │   ├── client.ts
│   │   └── schema/         # schema per domain
│   ├── modules/
│   │   ├── agenda/
│   │   ├── auth/
│   │   ├── clubs/
│   │   └── health/
│   ├── scripts/            # command administratif
│   ├── shared/             # error dan HTTP helpers
│   ├── types/
│   ├── app.ts              # komposisi Fastify
│   └── index.ts            # process entrypoint
├── drizzle/                # migration SQL versioned
├── tests/
├── .env.example
├── Dockerfile
├── drizzle.config.ts
└── package.json
```

Untuk modul baru gunakan pola:

```text
modules/applications/
├── application.routes.ts
├── application.service.ts
├── application.repository.ts
└── application.schema.ts
```

Route menangani HTTP, service menangani aturan bisnis, dan repository menjadi
satu-satunya lapisan yang mengakses database.

## Alternatif manual (bukan jalur standar tim)

Dari root project:

```bash
npm ci
cp backend/.env.example backend/.env
```

Ubah `DATABASE_URL` dan credential lokal. Jangan commit `.env`.

Jalur manual memerlukan PostgreSQL lokal terpisah yang sesuai DATABASE_URL.
Compose development tidak membuka port PostgreSQL ke host; jangan menganggap
database container tersedia di localhost:5432. Anggota yang mengikuti Docker
tidak perlu menjalankan bagian alternatif ini. Setelah database lokal siap, jalankan:

```bash
npm run db:migrate --workspace=@nurul-huda/backend
npm run admin:create --workspace=@nurul-huda/backend
npm run dev:backend
```

API tersedia di `http://127.0.0.1:4000/api/v1`.

- `GET /api/v1/health`: proses API hidup, tidak memeriksa database.
- `GET /api/v1/ready`: memastikan PostgreSQL dapat diakses.
- `POST /api/v1/auth/login`: membuat session admin.
- `GET /api/v1/auth/session`: membaca session aktif.
- `POST /api/v1/auth/logout`: menghapus session.

## Migration

Setelah mengubah file pada `src/db/schema/`:

```bash
npm run db:generate --workspace=@nurul-huda/backend
npm run db:migrate --workspace=@nurul-huda/backend
```

Review SQL hasil generate sebelum migration dijalankan. Jangan menjalankan
migration production tanpa backup database.

## Penyimpanan dokumen

File SKL, ijazah, KK, KTP orang tua, PIP/KIP, dan akta lahir tidak disimpan sebagai BLOB di PostgreSQL.
Database hanya menyimpan metadata dan `storageKey`. Di VPS gunakan direktori
privat seperti:

```text
/srv/nurul-huda/private/uploads/
```

Direktori ini tidak boleh dijadikan static/public directory. Akses file nantinya
harus melalui endpoint terautentikasi dan authorization check.

## Production minimum

- jalankan backend sebagai user non-root;
- PostgreSQL tidak diekspos ke internet;
- gunakan HTTPS melalui Nginx atau Caddy;
- isi `TRUST_PROXY=true` bila backend berada di belakang reverse proxy;
- gunakan password database unik;
- backup PostgreSQL dan direktori upload ke mesin/object storage lain;
- jalankan `npm run check` sebelum deploy.
