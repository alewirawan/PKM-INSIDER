# Backend SMP Nurul Huda

Backend dasar menggunakan Fastify, TypeScript, PostgreSQL, dan Drizzle ORM. Target
deployment adalah satu VPS untuk satu sekolah.

## Isi fondasi saat ini

- konfigurasi environment tervalidasi;
- PostgreSQL client dan schema Drizzle;
- tabel `admins`, `admin_sessions`, `applications`, `application_documents`, dan `posts`;
- migration SQL awal serta migration artikel beserta pemindahan empat artikel contoh;
- autentikasi admin berbasis cookie session;
- API Blog publik dan admin (CRUD artikel) dengan tanggal `publishedAt`;
- rate limit login dan global request;
- CORS allowlist, Helmet, multipart limit, dan error envelope konsisten;
- endpoint health dan readiness;
- test untuk health, 404, validasi login, proteksi endpoint admin artikel, dan validasi payload artikel;
- Dockerfile dan Compose PostgreSQL.

CRUD pendaftar, dokumen, direktori, agenda, pesan, dan settings berikutnya dibuat per modul dengan mengikuti `../contracts/openapi.yaml`. Modul artikel sudah tersedia.

## Struktur

```text
backend/
├── src/
│   ├── config/             # environment
│   ├── db/
│   │   ├── client.ts
│   │   └── schema/         # schema per domain
│   ├── modules/
│   │   ├── auth/
│   │   ├── health/
│   │   └── posts/
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

## Menjalankan lokal

Dari root project:

```bash
npm ci
cp backend/.env.example backend/.env
```

Ubah `DATABASE_URL` dan credential lokal. Jangan commit `.env`.

Jalankan PostgreSQL melalui Compose:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml up -d
```

Sebelum menyalakan database pertama kali, isi `POSTGRES_PASSWORD` dan password di
`DATABASE_URL` pada `backend/.env` dengan nilai yang sama. Compose development
membuka PostgreSQL hanya ke `127.0.0.1:5432`, sehingga API dapat berjalan langsung
di komputer anggota. Setelah database healthy, jalankan:

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
- `GET /api/v1/posts`: artikel terbit untuk publik.
- `GET /api/v1/posts/by-slug/:slug`: detail artikel terbit.
- `GET /api/v1/admin/posts`: semua artikel untuk editor/admin.
- `POST /api/v1/posts`, `PATCH /api/v1/posts/:postId`, `DELETE /api/v1/posts/:postId`: CRUD artikel (role `super_admin` dan `editor`).

## Migration

Setelah mengubah file pada `src/db/schema/`:

```bash
npm run db:generate --workspace=@nurul-huda/backend
npm run db:migrate --workspace=@nurul-huda/backend
```

Review SQL hasil generate sebelum migration dijalankan. Jangan menjalankan
migration production tanpa backup database.

## Penyimpanan dokumen

File KK, ijazah, akta, dan pasfoto tidak disimpan sebagai BLOB di PostgreSQL.
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
