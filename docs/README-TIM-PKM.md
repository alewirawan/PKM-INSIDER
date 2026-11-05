# Panduan Kerja Tim PKM SMP Nurul Huda

Diperbarui: 15 Oktober 2026. Tim: 10 anggota. Repository:
https://github.com/alewirawan/PROJECT-PKM-SMP-NURUL-HUDA

Panduan ini membagi pekerjaan berdasarkan menu dan hasil yang harus dapat
didemonstrasikan. Frontend sudah berupa simulasi; backend baru fondasi. Anggota
melanjutkan source yang tersedia, bukan membuat ulang website.

Nama anggota, kemampuan, dan jadwal diisi saat rapat awal. Nomor di bawah adalah
peran kerja, bukan nama orang atau penilaian kemampuan. Penugasan teknis ini masih
perlu dipasangkan dengan anggota yang mampu atau mendapatkan pendamping.

## Cara mulai

Untuk anggota yang belum terbiasa dengan API atau struktur project, mulai dari
[Panduan Anggota](PANDUAN-ANGGOTA.md). Latihan awal di sana bukan target integrasi
lengkap pada tabel pembagian di bawah. Kerjakan satu kartu kecil bersama reviewer,
bukan seluruh daftar tugas anggota dalam satu perubahan.

1. Koordinator mengisi nama, kemampuan, reviewer, dan target sprint pada tabel tim.
2. Setiap anggota mengikuti [panduan instalasi](../PANDUAN-INSTALASI.md).
3. Buka menu yang ditugaskan dan baca file berstatus **ADA** sebelum menulis kode.
4. Baca bagian sendiri, aturan file bersama, dan [kontrak integrasi](../contracts/README.md).
5. Buat satu issue kecil, branch, implementasi, test, lalu pull request.
6. Mulai dari hasil pertama pada tabel, bukan mengerjakan seluruh modul sekaligus.

Perintah demo dari folder yang berisi package.json:

```bash
npm ci
npm run dev
```

Buka http://localhost:3000 dan /admin, lalu pilih mode demo. Demo tidak membutuhkan
database atau konfigurasi API. Backend hanya diaktifkan oleh anggota yang mulai
mengerjakan integrasi, mengikuti panduan instalasi. Jangan membagikan .env.

Semua path berikut relatif terhadap root repository:

- **ADA**: file/folder tersedia; baca, pakai kembali, lalu ubah sesuai tugas.
- **BARU**: rencana file yang dibuat saat issue terkait dikerjakan, bukan file yang sudah tersedia.
- Folder tidak dinamai anggota; pergantian penanggung jawab tidak memindahkan kode.

## Status yang menjadi dasar pekerjaan

| Bagian     | Sudah tersedia                                                                                       | Masih dikerjakan tim                                              |
| ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Website    | Beranda, Tentang, Program, Struktur dan Guru, Prestasi, Blog, Kontak, PPDB                           | Data API, loading/error, konten sekolah yang disetujui            |
| Admin      | Modul artikel, direktori, agenda, prestasi, ekstrakurikuler, pesan, pengaturan, pendaftar/data siswa | Integrasi dan penyimpanan database per menu                       |
| PPDB       | Empat langkah, pilihan ekstrakurikuler, enam jenis berkas, review                                    | Validasi server, nomor server, submit dan file nyata              |
| Berkas     | Pemilihan/preview lokal dan catatan/status pemeriksaan simulasi                                      | Storage privat, akses berizin, pencatatan pemeriksa/waktu         |
| Backend    | Auth, health, konfigurasi, schema awal, migration, error handler                                     | API seluruh resource sekolah, otorisasi per fitur, test integrasi |
| Setup      | compose.dev.yaml dengan port PostgreSQL loopback sudah ada                                           | Membuktikan setup database/login di komputer anggota              |
| Git        | main mengikuti repo tim                                                                              | Issue, branch, review, dan kebiasaan kerja tim                    |
| Production | Rancangan Compose/Docker                                                                             | Uji runtime, HTTPS, backup/restore dan izin sebelum VPS           |

Endpoint fondasi: GET /health, GET /ready, POST /auth/login,
GET /auth/session, POST /auth/logout, dengan prefix /api/v1.
Keberadaan kode bukan bukti login/database telah diuji end-to-end.

Kontrak OpenAPI 1.2.0 adalah target implementasi. Label planned tidak berarti
endpoint sudah berjalan. Frontend masih memakai penyimpanan browser; file pilihan
hanya berada di memori dan tidak diunggah. Gunakan data dummy.

Scope tahap utama: informasi satu sekolah dan penerimaan calon siswa. Bukan nilai,
absensi, pembagian kelas, atau sistem akademik siswa aktif. Newsletter, upload foto
publik guru/artikel, dan penghapusan permanen pendaftar adalah tahap lanjutan;
jangan mendahulukannya dari alur PPDB. Foto ilustrasi yang ada boleh dipakai dahulu.

## Pembagian dan kapasitas tim

| Anggota | Nama dan kemampuan | Bagian                                 | Reviewer utama                        | Hasil pertama                                                 |
| ------- | ------------------ | -------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| 1       | Diisi saat rapat   | Beranda, Tentang, frontend Pengaturan  | 9 untuk settings; 10 untuk layout     | Daftar field sekolah konsisten dan konten profil rapi         |
| 2       | Diisi saat rapat   | Program, Ekstrakurikuler, Agenda       | 5 untuk pilihan PPDB; 10 untuk schema | Kegiatan aktif dari API muncul pada pilihan PPDB              |
| 3       | Diisi saat rapat   | Struktur organisasi dan Guru           | 4; 9 untuk izin                       | Satu guru dari database tampil di website                     |
| 4       | Diisi saat rapat   | Blog dan Artikel admin                 | 3                                     | Artikel terbit dari API; draft tidak terlihat publik          |
| 5       | Diisi saat rapat   | PPDB online dan menu Pendaftar         | 6 dan 7                               | Submit data dan berkas dummy mendapat bukti server            |
| 6       | Diisi saat rapat   | Data siswa, pencarian, input offline   | 5 dan 7                               | Daftar/detail pendaftar dari API                              |
| 7       | Diisi saat rapat   | Penyimpanan dan pemeriksaan berkas     | 9 dan 6                               | Satu file dummy tersimpan privat dan akses tanpa izin ditolak |
| 8       | Diisi saat rapat   | Kontak, Pesan, Prestasi                | 4                                     | Pesan Kontak tampil di admin; berikutnya satu prestasi terbit |
| 9       | Diisi saat rapat   | Auth, hak akses, backend Pengaturan    | 10                                    | Login, session, logout diuji dengan database                  |
| 10      | Diisi saat rapat   | Dashboard, setup, koordinasi integrasi | 9                                     | Setup berhasil di komputer anggota lain                       |

Anggota 2 dan 8 memegang dua modul CRUD; kerjakan berurutan, bukan sekaligus.
Anggota 5–7 dan 9 memiliki risiko teknis lebih tinggi dan perlu pendampingan.
Anggota 10 mengoordinasikan integrasi, bukan mengambil alih seluruh implementasi.
Reviewer adalah pasangan review yang diusulkan; tugas keamanan perlu reviewer
yang benar-benar memahami autentikasi dan penyimpanan privat.

Setiap anggota menguji serta memperbaiki fiturnya sendiri. Pengujian lintas menu
dilakukan berpasangan; tidak ditumpuk pada anggota 8. Pemula dapat mulai dari
konten, tampilan, kasus uji, dan satu request baca dengan pendamping, kemudian
mengambil issue menulis data yang kecil. Beban baru dapat disebut seimbang setelah
kemampuan dan waktu tersedia diketahui.

## Struktur target

```text
frontend/app/components/                 ADA
frontend/app/components/admin/           ADA
frontend/app/components/registration/    ADA
frontend/app/components/school-directory/ ADA
frontend/app/components/student-records/ ADA
frontend/app/lib/cms/                    ADA, adapter simulasi
frontend/app/lib/api-client.ts           ADA, HTTP helper bersama
frontend/app/lib/api/                    BARU, client per fitur
frontend/app/lib/content/                BARU bila konten statis perlu dipisah
frontend/app/styles/                     ADA, CSS berdasarkan domain
backend/src/modules/auth/                ADA
backend/src/modules/health/              ADA
backend/src/modules/                     BARU untuk modul fitur lain
backend/src/db/schema/                   ADA; tambah schema per domain
backend/drizzle/                        ADA; migration dikoordinasikan
contracts/openapi.yaml                   ADA, acuan target API
```

Backend memakai pola routes → service → repository. File _.schema.ts di modul
memvalidasi request; file db/schema/_.ts mendefinisikan tabel. Frontend mengakses
API, tidak mengimpor repository atau schema database.

Folder lib/api tidak menggantikan seluruh lib/cms sekaligus. Migrasikan per fitur;
jika API gagal, tampilkan error, bukan diam-diam mengembalikan seed demo.

## Anggota 1 Beranda Tentang dan frontend Pengaturan

**ADA — baca dan ubah sesuai kebutuhan:**

```text
frontend/app/page.tsx
frontend/app/tentang/page.tsx
frontend/app/components/HomeNews.tsx
frontend/app/components/SchoolSettingsProvider.tsx
frontend/app/components/admin/SettingsModule.tsx
frontend/app/components/SiteHeader.tsx
frontend/app/components/SiteFooter.tsx
frontend/app/styles/public/editorial.css
frontend/app/styles/public/inner-pages.css
```

**BARU — dibuat saat mulai integrasi:**

```text
frontend/app/lib/api/settings.ts
frontend/app/lib/content/home.ts
frontend/app/lib/content/about.ts
```

- [ ] Pisahkan konten profil yang panjang tanpa membuat editor seluruh halaman.
- [ ] Hubungkan Pengaturan ke API 9: identitas, daftar berkas wajib, jadwal manual, dan toggle PPDB.
- [ ] PIP/KIP tetap opsional; perubahan syarat hanya berlaku pada pendaftaran baru.
- [ ] HomeNews memakai artikel terbit dari anggota 4.
- [ ] Ringkasan prestasi memakai komponen/data anggota 8, bukan API kedua.
- [ ] Koordinasikan perubahan navigasi dengan 10; pertahankan guardrail sticky.
- [ ] Uji mobile/desktop, data kosong, dan kegagalan membaca Pengaturan.

**Batas:** backend settings milik 9. Tidak membuat backend home/about.
**Selesai jika:** pengaturan tersimpan di server dan informasi tampil konsisten;
berita/prestasi beranda mengikuti publikasi pemilik modul.

## Anggota 2 Program Ekstrakurikuler dan Agenda

**ADA:**

```text
frontend/app/program/page.tsx
frontend/app/components/ClubDirectory.tsx
frontend/app/components/admin/ClubsModule.tsx
frontend/app/components/admin/AgendaModule.tsx
frontend/app/lib/cms/catalog.ts
frontend/app/lib/cms/agenda.ts
frontend/app/lib/use-catalog.ts
frontend/app/styles/public/programs.css
frontend/app/styles/admin/catalog.css
```

**BARU:**

```text
frontend/app/lib/api/clubs.ts
frontend/app/lib/api/agenda.ts
backend/src/modules/clubs/club.routes.ts
backend/src/modules/clubs/club.schema.ts
backend/src/modules/clubs/club.service.ts
backend/src/modules/clubs/club.repository.ts
backend/src/modules/agenda/agenda.routes.ts
backend/src/modules/agenda/agenda.schema.ts
backend/src/modules/agenda/agenda.service.ts
backend/src/modules/agenda/agenda.repository.ts
backend/src/db/schema/clubs.ts
backend/src/db/schema/agenda.ts
backend/tests/clubs.test.ts
backend/tests/agenda.test.ts
```

- [ ] Kerjakan klub dahulu: daftar aktif, daftar admin, tambah/edit/nonaktif.
- [ ] Nama kegiatan unik; pilihan Belum menentukan bukan record kegiatan.
- [ ] Sediakan client multiselect opsional untuk 5 dan 6; daftar pilihan historis tidak ikut berubah saat rename.
- [ ] Setelah klub selesai, kerjakan Agenda dan kontrol Publik/Internal di UI admin.
- [ ] Rapat/internal tidak boleh bocor dari endpoint publik.
- [ ] Gunakan API dan izin role; narasi Program boleh tetap statis.

**Batas:** jangan edit field PPDB milik 5/6 tanpa koordinasi. catalog.ts dan
use-catalog.ts dipakai juga oleh 8; perubahan bersama direview 10.
**Selesai jika:** pilihan kegiatan konsisten dan admin agenda/klub tersimpan di server.

## Anggota 3 Struktur organisasi dan Guru

**ADA:**

```text
frontend/app/struktur/page.tsx
frontend/app/components/DirectoryTabs.tsx
frontend/app/components/OrganizationDirectory.tsx
frontend/app/components/TeacherDirectory.tsx
frontend/app/components/SchoolDirectoryModule.tsx
frontend/app/components/school-directory/DirectoryEditor.tsx
frontend/app/components/school-directory/DirectoryStructureTab.tsx
frontend/app/components/school-directory/DirectoryTeachersTab.tsx
frontend/app/components/school-directory/shared.ts
frontend/app/school-directory-data.ts
frontend/app/styles/directory/organization.css
frontend/app/styles/directory/teachers.css
frontend/app/styles/directory/admin-directory.css
```

**BARU:**

```text
frontend/app/lib/api/directory.ts
backend/src/modules/directory/directory.routes.ts
backend/src/modules/directory/directory.schema.ts
backend/src/modules/directory/directory.service.ts
backend/src/modules/directory/directory.repository.ts
backend/src/db/schema/directory.ts
backend/tests/directory.test.ts
```

- [ ] Simpan profil guru/pimpinan, urutan, level, dan foto contoh.
- [ ] Hubungkan halaman publik dan editor admin ke API yang sama.
- [ ] Izinkan nol atau satu kepala sekolah; tolak dua kepala sekolah.
- [ ] Uji tambah/hapus profil, pindah level, dan seluruh tingkat kosong.
- [ ] Direktori publik hanya memuat field yang layak dipublikasikan.
- [ ] Cegah simpan direktori sebagian saat salah satu operasi gagal.

**Selesai jika:** perubahan struktur tersimpan, muncul di publik, dan tidak merusak
layout ketika jumlah anggota berubah. Upload foto nyata bukan tugas berkas privat 7.

## Anggota 4 Blog dan Artikel admin

**ADA:**

```text
frontend/app/blog/page.tsx
frontend/app/blog/[slug]/page.tsx
frontend/app/components/PublicBlog.tsx
frontend/app/components/BlogDetailView.tsx
frontend/app/components/HomeNews.tsx
frontend/app/components/admin/PostsModule.tsx
frontend/app/lib/cms/posts.ts
frontend/app/sitemap.ts
frontend/app/styles/public/blog.css
frontend/app/styles/admin/articles.css
```

**BARU:**

```text
frontend/app/lib/api/posts.ts
backend/src/modules/posts/post.routes.ts
backend/src/modules/posts/post.schema.ts
backend/src/modules/posts/post.service.ts
backend/src/modules/posts/post.repository.ts
backend/src/db/schema/posts.ts
backend/tests/posts.test.ts
```

- [ ] Buat daftar publik terbit, daftar admin termasuk draft, dan detail slug.
- [ ] Tambah/edit/hapus artikel dengan slug unik dan otorisasi.
- [ ] Artikel baru dapat dibuka melalui URL langsung, bukan hanya daftar seed.
- [ ] Metadata dan sitemap mengikuti sumber terbit yang sama.
- [ ] Sediakan fungsi artikel terbaru untuk 1; koordinasikan HomeNews.

**Selesai jika:** publish muncul di blog dan beranda; draft/slug tidak ada tidak
mengungkap isi artikel privat. Gambar memakai aset yang tersedia dahulu.

## Anggota 5 PPDB online dan menu Pendaftar

**ADA:**

```text
frontend/app/pendaftaran/page.tsx
frontend/app/components/RegistrationForm.tsx
frontend/app/components/registration/StudentFields.tsx
frontend/app/components/registration/DocumentFields.tsx
frontend/app/components/registration/RegistrationReview.tsx
frontend/app/components/registration/FilePreview.tsx
frontend/app/components/admin/ApplicationsModule.tsx
frontend/app/lib/registration-files.ts
frontend/app/styles/public/registration.css
frontend/app/styles/public/enrollment.css
backend/src/db/schema/admissions.ts
```

**BARU:**

```text
frontend/app/lib/api/applications/submission.ts
frontend/app/lib/api/applications/types.ts
frontend/app/pendaftar/page.tsx
frontend/app/components/registration/ApplicantPortal.tsx
frontend/app/lib/api/applications/self-service.ts
backend/src/modules/applications/submission.routes.ts
backend/src/modules/applications/submission.schema.ts
backend/src/modules/applications/submission.service.ts
backend/src/modules/applications/submission.repository.ts
backend/src/modules/applications/self-service.routes.ts
backend/src/modules/applications/self-service.schema.ts
backend/src/modules/applications/self-service.service.ts
backend/src/modules/applications/self-service.repository.ts
backend/tests/application-self-service.test.ts
backend/src/modules/applications/registration-number.ts
backend/src/modules/applications/application.mapper.ts
backend/src/modules/applications/application-status.service.ts
backend/src/db/schema/applications.ts
backend/tests/application-submission.test.ts
```

- [ ] Gunakan empat langkah yang ada; ubah pilihan kegiatan menjadi multiselect opsional.
- [ ] Baca aturan berkas wajib dari settings; jangan menanam daftar wajib tetap di UI.
- [ ] Buat area pribadi untuk melihat catatan dan memperbaiki berkas, memakai akses dari 9.
- [ ] POST /applications menerima multipart: data JSON dan enam slot berkas.
- [ ] Validasi identitas, pilihan kegiatan aktif, PPDB dibuka, dan berkas wajib di server.
- [ ] Nomor pendaftaran unik dibuat server; dukung retry tanpa pendaftar ganda.
- [ ] Gunakan service berkas 7; sukses hanya setelah data dan file tersimpan.
- [ ] Menu Pendaftar membaca daftar/detail dan perubahan status melalui API 6.
- [ ] CSV mengekspor hasil filter secara jelas; jangan diam-diam hanya satu halaman.
- [ ] Pertahankan isian saat gagal, disable submit saat request berjalan, tampilkan error.

**Batas:** bukan pemilik endpoint daftar/detail/offline. Schema applications.ts
adalah pemisahan admissions.ts, bukan tabel pendaftar baru. UI FilePreview dipakai
juga oleh 6, perubahan harus direview bersama.
**Selesai jika:** submit lengkap mendapat bukti minimal, muncul di admin, dan retry
tidak menggandakan pendaftaran. Pendaftar memperbaiki berkas sendiri dan admin
memeriksa ulang; nomor pendaftaran bukan password atau token akses.

## Anggota 6 Data calon siswa dan pendaftaran offline

**ADA:**

```text
frontend/app/components/StudentRecordsModule.tsx
frontend/app/components/student-records/StudentProfileDrawer.tsx
frontend/app/components/student-records/OfflineStudentForm.tsx
frontend/app/components/student-records/DocumentReview.tsx
frontend/app/components/student-records/shared.tsx
frontend/app/lib/cms/applications.ts
frontend/app/lib/cms/student-documents.ts
frontend/app/styles/directory/student-ledger.css
frontend/app/styles/directory/student-profile.css
frontend/app/styles/directory/student-entry.css
```

**BARU:**

```text
frontend/app/lib/api/applications/records.ts
backend/src/modules/applications/records.routes.ts
backend/src/modules/applications/records.schema.ts
backend/src/modules/applications/records.service.ts
backend/src/modules/applications/records.repository.ts
backend/tests/application-records.test.ts
```

- [ ] Daftar, pencarian, sumber, status, kelengkapan, dan pagination dilakukan server.
- [ ] Buat detail, edit identitas, serta input offline dengan izin admin PPDB.
- [ ] Input offline memakai multiselect opsional dan snapshot kebijakan berkas saat dicatat.
- [ ] Gunakan generator nomor dan aturan status dari 5.
- [ ] Pakai DocumentReview.tsx yang sudah ada, bukan membuat StudentDocumentsPanel kedua.
- [ ] Hubungkan status/catatan dan download melalui client dokumen 7.
- [ ] Bedakan berkas fisik diterima, file digital tersedia, dan hasil verifikasi.
- [ ] Uji data tidak ditemukan, akses ditolak, serta sinkronisasi dua menu pendaftar.

**Selesai jika:** data online/offline bisa dicari dan diedit melalui satu tabel
applications. Jangan membuat tabel students untuk menduplikasi calon siswa.

## Anggota 7 Penyimpanan dan pemeriksaan berkas

**ADA sebagai acuan tanpa mengambil alih UI:**

```text
backend/src/db/schema/admissions.ts
frontend/app/lib/cms/student-documents.ts
frontend/app/lib/registration-files.ts
frontend/app/components/registration/DocumentFields.tsx
frontend/app/components/student-records/DocumentReview.tsx
```

**BARU:**

```text
frontend/app/lib/api/documents.ts
backend/src/modules/documents/document.routes.ts
backend/src/modules/documents/document.schema.ts
backend/src/modules/documents/document.service.ts
backend/src/modules/documents/document.repository.ts
backend/src/modules/documents/document.storage.ts
backend/src/modules/documents/document.mapper.ts
backend/src/db/schema/documents.ts
backend/tests/documents.test.ts
```

- [ ] Validasi ukuran maksimal 5 MiB, signature PDF/JPG/PNG, jumlah dan jenis berkas.
- [ ] Simpan nama internal acak pada direktori privat, bukan frontend/public.
- [ ] Sediakan service submit publik 5, endpoint upload admin, dan koreksi berkas pemilik terautentikasi.
- [ ] Pendaftar mengirim file pengganti; status menjadi Menunggu pemeriksaan, bukan langsung terverifikasi.
- [ ] Jangan hapus otomatis berkas yang sudah tersimpan/versi lama. Cleanup hanya file sementara gagal.
- [ ] Jangan menerima upload publik ke applicationId yang sudah ada hanya berdasarkan nomor.
- [ ] Metadata, penggantian file, cleanup kegagalan, serta idempotency dikerjakan bersama 5.
- [ ] Download memeriksa session, role, dan relasi dokumen-pendaftar.
- [ ] PATCH review mencatat status, catatan, pemeriksa, dan waktu server.
- [ ] Sediakan client blob download; jangan pakai helper JSON untuk membaca file biner.
- [ ] Uji berkas kosong/palsu/terlalu besar, akses lintas pendaftar, gagal simpan, dan file pengganti.

**Batas:** UI form milik 5, UI detail milik 6, autentikasi milik 9.
Schema documents.ts berasal dari pemisahan admissions.ts. Jangan drop/recreate
tabel lama hanya untuk memindahkan file schema.
**Selesai jika:** file nyata dapat ditinjau admin setelah refresh, tidak bocor ke publik,
dan kegagalan tidak meninggalkan metadata yang mengaku memiliki file padahal tidak ada.

## Anggota 8 Kontak Pesan dan Prestasi

**ADA:**

```text
frontend/app/kontak/page.tsx
frontend/app/components/ContactForm.tsx
frontend/app/components/admin/MessagesModule.tsx
frontend/app/lib/cms/messages.ts
frontend/app/prestasi/page.tsx
frontend/app/components/Achievements.tsx
frontend/app/components/admin/AchievementsModule.tsx
frontend/app/lib/cms/catalog.ts
frontend/app/lib/use-catalog.ts
frontend/app/styles/public/contact.css
frontend/app/styles/public/achievements.css
frontend/app/styles/admin/catalog.css
```

**BARU:**

```text
frontend/app/lib/api/messages.ts
frontend/app/lib/api/achievements.ts
backend/src/modules/messages/message.routes.ts
backend/src/modules/messages/message.schema.ts
backend/src/modules/messages/message.service.ts
backend/src/modules/messages/message.repository.ts
backend/src/modules/achievements/achievement.routes.ts
backend/src/modules/achievements/achievement.schema.ts
backend/src/modules/achievements/achievement.service.ts
backend/src/modules/achievements/achievement.repository.ts
backend/src/db/schema/messages.ts
backend/src/db/schema/achievements.ts
backend/tests/messages.test.ts
backend/tests/achievements.test.ts
```

- [ ] Selesaikan pesan dahulu: kirim publik dengan validasi/rate limit, baca/status admin.
- [ ] Berikutnya prestasi: daftar terbit, daftar admin, tambah/edit/hapus/draft.
- [ ] Hubungkan filter kategori/tahun dan ringkasan beranda ke data terbit.
- [ ] Draft tidak boleh tampil pada endpoint publik, termasuk saat parameter dimanipulasi.
- [ ] Gunakan aset ilustrasi yang disediakan; jangan mengklaim contoh sebagai prestasi nyata.
- [ ] Koordinasikan catalog.ts/use-catalog.ts dengan 2 dan ringkasan beranda dengan 1.

**Selesai jika:** pesan dan prestasi tersimpan di database, draft privat, serta
publikasi tampil konsisten. Newsletter tahap lanjutan; tidak ada tugas mengirim
email nyata. Pengujian seluruh tim bukan tanggung jawab tunggal anggota 8.

## Anggota 9 Auth izin akses dan backend Pengaturan

**ADA:**

```text
frontend/app/components/admin/AdminLogin.tsx
frontend/app/lib/api-client.ts
backend/src/modules/auth/auth.routes.ts
backend/src/modules/auth/auth.service.ts
backend/src/modules/auth/auth.repository.ts
backend/src/db/schema/auth.ts
backend/src/scripts/create-admin.ts
backend/src/config/env.ts
```

**BARU:**

```text
frontend/app/lib/api/auth.ts
frontend/app/components/admin/AdminAuthProvider.tsx
backend/src/modules/auth/auth.guard.ts
backend/src/modules/applicant-auth/applicant-auth.routes.ts
backend/src/modules/applicant-auth/applicant-auth.schema.ts
backend/src/modules/applicant-auth/applicant-auth.service.ts
backend/src/modules/applicant-auth/applicant-auth.repository.ts
backend/tests/applicant-auth.test.ts
backend/src/modules/settings/settings.routes.ts
backend/src/modules/settings/settings.schema.ts
backend/src/modules/settings/settings.service.ts
backend/src/modules/settings/settings.repository.ts
backend/src/db/schema/settings.ts
backend/tests/auth.test.ts
backend/tests/settings.test.ts
```

- [ ] Uji fondasi login/session/logout dengan database; tidak menulis ulang tanpa alasan.
- [ ] Buat guard role dan proteksi request cookie pengubah data.
- [ ] Pemilik fitur memasang guard pada routenya sendiri; 9 mereview penerapannya.
- [ ] Sediakan Pengaturan publik dan simpan terproteksi: berkas wajib, toggle buka/tutup dan informasi jadwal manual.
- [ ] Rancang akses pendaftar untuk online/offline, login/logout, pemulihan, dan session terpisah; review bersama 5 dan 10.
- [ ] Kontrak alur penerbitan/pemulihan akses belum dipilih; selesaikan sebelum endpoint koreksi diaktifkan.
- [ ] PPDB ditutup ditolak server; input offline terotorisasi tetap diperbolehkan.
- [ ] Samakan batas file dengan kontrak bersama 7; jangan menganggap UI membatasi server.
- [ ] Session kedaluwarsa dan logout menghapus akses; tidak cukup menyembunyikan tombol.

**Selesai jika:** tes izin lulus dan Pengaturan tersimpan. Akun/password nyata tidak
masuk repo; demonstrasi memakai akun development masing-masing.

## Anggota 10 Dashboard setup dan koordinasi integrasi

**ADA:**

```text
frontend/app/components/AdminDashboard.tsx
frontend/app/components/admin/DashboardModule.tsx
frontend/app/components/admin/types.ts
frontend/app/lib/api-client.ts
frontend/app/lib/cms/types.ts
backend/src/app.ts
backend/src/db/client.ts
backend/src/db/schema/index.ts
backend/drizzle/
compose.dev.yaml
compose.yaml
backend/Dockerfile
.github/workflows/quality.yml
package.json
package-lock.json
```

**BARU:**

```text
frontend/app/lib/api/dashboard.ts
backend/src/modules/dashboard/dashboard.routes.ts
backend/src/modules/dashboard/dashboard.schema.ts
backend/src/modules/dashboard/dashboard.service.ts
backend/src/modules/dashboard/dashboard.repository.ts
backend/tests/dashboard.test.ts
.dockerignore
```

- [ ] Verifikasi setup bersih di komputer lain menggunakan compose.dev.yaml yang sudah ada.
- [ ] Koordinasikan pendaftaran route, ekspor schema, dan migration berurutan.
- [ ] Shell admin hanya mengurus navigasi/layout/session; request domain milik pemilik menu.
- [ ] Buat ringkasan server, bukan mengambil seluruh biodata untuk menghitung angka.
- [ ] Role selain super_admin tidak meminta endpoint ringkasan lintas domain.
- [ ] Tampilkan indikator yang memiliki sumber nyata; hilangkan klaim statistik contoh saat integrasi.
- [ ] Review dependency, CI, serta rencana Docker/VPS setelah alur utama teruji.
- [ ] Data disimpan tanpa penghapusan otomatis; rencanakan kapasitas, backup/restore dan monitoring storage.

**Selesai jika:** setup dapat diulang dan dashboard memiliki angka server yang sesuai
data. Tidak membuat tabel dashboard atau mengambil alih seluruh API yang tertunda.

## Batas pekerjaan bersama

| Operasi atau file                               | Pemilik                        | Aturan                                                                              |
| ----------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| POST /applications                              | 5                              | Memanggil service berkas 7, bukan menulis storage kedua                             |
| GET daftar/detail dan PATCH pendaftar           | 6                              | Dipakai Pendaftar dan Data siswa; jangan membuat handler ganda                      |
| POST /applications/offline                      | 6                              | Nomor dan mapper bersama 5                                                          |
| Aturan transisi penerimaan                      | 5                              | Endpoint PATCH milik 6 menggunakan service ini                                      |
| Upload/download/review dokumen                  | 7                              | Session/role dari 9, UI dari 5 dan 6                                                |
| Application types dan schema tabel              | 5, review 6                    | Perubahan field harus disetujui konsumen                                            |
| DocumentReview.tsx dan StudentProfileDrawer.tsx | 6                              | 7 tidak membuat panel tandingan                                                     |
| FilePreview.tsx                                 | 5, review 6                    | Dipakai form dan admin                                                              |
| catalog.ts dan use-catalog.ts                   | 2 dan 8, review 10             | Jangan dua PR merombak file yang sama bersamaan; pemisahan opsional lewat PR khusus |
| frontend/app/lib/api-client.ts                  | 10, review 9                   | Helper HTTP bersama; timeout serta penanganan JSON/biner jelas                      |
| AdminDashboard.tsx                              | 10                             | Perubahan navigasi/props dikomunikasikan pemilik menu                               |
| SiteHeader.tsx dan SiteFooter.tsx               | 1, review 10                   | Hindari regresi sticky dan navigasi mobile                                          |
| backend/src/app.ts dan db/schema/index.ts       | 10                             | Pemilik fitur menyiapkan usulan registrasi/ekspor                                   |
| backend/drizzle/                                | 10                             | Generate berurutan setelah schema terbaru digabung                                  |
| contracts/openapi.yaml                          | Pemilik operasi, koordinasi 10 | x-owner memberi nomor penanggung jawab                                              |
| package.json dan package-lock.json              | 10                             | Jangan menambah dependency sendiri tanpa review                                     |
| globals.css dan aggregator CSS                  | 10                             | CSS domain tetap milik anggota fitur                                                |

## Kesepakatan integrasi PPDB

- API menerima extracurriculars berupa array opsional. [] berarti belum memilih;
  boleh lebih dari satu. Jangan mengirim program atau extracurricular lama.
- Frontend sekarang masih memilih satu kegiatan; 5 dan 6 mengubahnya menjadi
  multiselect. Pilihan lama Belum menentukan dipetakan ke [], nama tunggal ke [nama].
- Simpan snapshot nama agar rename/nonaktif tidak mengubah daftar pilihan lama.
- API menggunakan source; frontend mockup menggunakan registrationSource.
  Mapper mengonversi Website/Offline secara eksplisit.
- ID API berupa nomor NH-...; UUID database internal tidak dipakai sebagai bukti izin.
- API dokumen menggunakan kind; frontend mockup memakai key. photo hanya metadata
  lama, bukan slot upload baru.
- Enam slot: skl, ijazah, kk, ktp, kip, akta. Admin menentukan berkas wajib;
  PIP/KIP selalu opsional. Simpan snapshot persyaratan per pendaftaran.
- Satu request multipart awal berisi data JSON dan file. Sesudahnya, koreksi
  melalui area pribadi pendaftar terautentikasi, bukan nomor pendaftaran saja.
- Pendaftar mengganti berkas yang perlu diperbaiki; status kembali Menunggu
  pemeriksaan dan admin memverifikasi. Review berkas tidak otomatis menerima siswa.
- Buka/tutup PPDB oleh admin; informasi tanggal diisi manual, tanpa scheduler.
- Tidak ada syarat usia/kelayakan tambahan; validasi format/tanggal tetap berlaku.
- Data dan berkas tersimpan tanpa penghapusan otomatis, dengan backup/restore.
- Offline boleh belum lengkap; receivedDocumentKinds menandai fisik diterima.
  hasFile=false berarti tidak ada file digital untuk ditinjau.
- Kontrak target, mapping, keamanan, dan batas retry dijelaskan di
  [panduan kontrak](../contracts/README.md). Implementasi harus memiliki test,
  bukan hanya menyalin definisi YAML.

## Urutan pengerjaan dengan pendekatan Agile

Sprint berikut adalah urutan hasil, bukan janji durasi tetap. Isi tanggal setelah
anggota menyepakati kapasitas. Issue boleh dipecah lebih kecil bila belum selesai.

| Tahap          | Fokus                                                            | Bukti untuk lanjut                                          |
| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Persiapan      | Nama, reviewer, aturan sekolah, setup dan baca kontrak           | Semua bisa membuka demo; satu mesin berhasil database/login |
| Sprint 1       | Satu alur baca dan tulis sederhana bersama, misalnya guru        | Tabel → API → UI → buka ulang dari browser lain             |
| Sprint 2       | Klub, artikel, direktori, settings, pesan; fondasi file privat   | PR kecil dengan test; pilihan PPDB/API dokumen siap dipakai |
| Sprint 3       | Submit PPDB + file, offline, detail, review; prestasi dan agenda | Alur lengkap dengan data dummy termasuk kegagalan           |
| Sprint 4       | Dashboard, test lintas menu, perbaikan mobile/desktop            | Kriteria selesai fitur dan review keamanan terpenuhi        |
| Kesiapan rilis | VPS, HTTPS, backup/restore, izin, konfigurasi production         | Bukti uji dan persetujuan koordinator/sekolah               |

Tiap sprint dimulai memilih issue sesuai kapasitas, ada demo hasil, lalu evaluasi
hambatan. Gunakan board Backlog → Siap → Dikerjakan → Review → Selesai; status
Terblokir menyebut ketergantungan dan penanggung jawab, bukan menyembunyikan masalah.

## Langkah Git per anggota

Untuk anggota yang belum memiliki clone:

```bash
git clone https://github.com/alewirawan/PROJECT-PKM-SMP-NURUL-HUDA.git
cd PROJECT-PKM-SMP-NURUL-HUDA
npm ci
```

Sebelum membuat branch, pastikan git status tidak berisi perubahan yang belum
disimpan. Jangan menjalankan clone ulang di dalam project-k yang sudah terhubung.

Contoh tugas Blog:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/blog-public-list
```

Setelah implementasi, review git diff dan stage file yang tepat, bukan seluruh
folder artifacts. Commit lalu push branch sendiri dan ajukan pull request.
Jangan force-push main, menghapus migration yang sudah dipakai, atau menyelesaikan
konflik dengan membuang pekerjaan anggota lain. Koordinator mereview merge;
aturan proteksi branch GitHub perlu dikonfigurasi terpisah bila belum ada.

## Template issue dan kriteria selesai

Gunakan [template tugas](../.github/ISSUE_TEMPLATE/tugas.md) dan
[template PR](../.github/pull_request_template.md). Keduanya tersedia sebagai file
lokal; pilihan template GitHub aktif setelah masuk ke branch default repository.

```text
Judul: A4 menampilkan artikel terbit dari API
Pemilik: nama anggota 4
Reviewer: nama anggota 3
Menu: Blog
File ADA: frontend/app/components/PublicBlog.tsx
File BARU: frontend/app/lib/api/posts.ts; backend/src/modules/posts/
Kontrak: GET /posts
Ketergantungan: koneksi database dan schema artikel
Hasil: artikel terbit terlihat; draft tidak bocor
Test: data ada, kosong, API gagal, akses draft ditolak
Bukti: langkah mencoba, hasil test, screenshot desktop/mobile tanpa data nyata
Status: Backlog
```

Checklist berikut berlaku untuk fitur integrasi lengkap. Tugas latihan, tampilan,
atau dokumentasi mengikuti kriteria kartu masing-masing dan tidak wajib membuat
API/database. Selesainya satu kartu tampilan tidak berarti seluruh fitur selesai.

Setiap fitur integrasi baru selesai bila:

- [ ] Data disimpan/dibaca server, bukan hanya state/browser mockup.
- [ ] Loading, kosong, input salah, timeout, dan kegagalan ditangani.
- [ ] Sukses ditampilkan setelah server berhasil; retry tidak menggandakan data.
- [ ] Hak akses diuji di endpoint, bukan hanya lewat tampilan.
- [ ] UI diperiksa pada mobile dan desktop, termasuk form serta panel panjang.
- [ ] Kontrak dan mapping frontend konsisten, termasuk field wajib.
- [ ] Pemilik dapat menjelaskan dan mendemonstrasikan kode bagiannya.
- [ ] Reviewer menyetujui; tidak ada secret, dokumen nyata, ZIP, atau cache dalam commit.

Pemeriksaan kode saat implementasi:

```bash
npm run check
npm run build --workspace=@nurul-huda/backend
```

Jika mengubah kontrak, jalankan juga pemeriksaan OpenAPI dan kasus schema
sesuai [panduan kontrak](../contracts/README.md). Test tersebut belum dimasukkan
ke npm run check; koordinator menjalankannya secara terpisah saat review kontrak.

Tes otomatis tidak menggantikan uji database nyata, file privat, dan interaksi
browser. Jangan klaim siap production hanya karena halaman terbuka atau health
merespons.

## Keputusan kebutuhan yang sudah ditetapkan

Berkas wajib dapat diatur admin. PIP/KIP hanya jika punya. Jadwal diatur manual,
tidak ada syarat usia/kelayakan tambahan, dan ekstrakurikuler boleh beberapa serta
opsional. Admin mengambil keputusan penerimaan. Pendaftar memperbaiki berkas lalu
admin memverifikasi. Masa simpan tanpa penghapusan otomatis. Keputusan ini menjadi
target implementasi; frontend dan backend sekarang belum menerapkannya seluruhnya.

## Hal yang harus diputuskan saat rapat pertama

- Nama, kemampuan, waktu tersedia, reviewer, serta tanggal sprint tiap anggota.
- Isi awal daftar berkas wajib dan tanggal jadwal; sistemnya dapat diatur admin.
- Pilihan mekanisme akses pribadi serta pemulihan akses pendaftar (9 bersama 5 dan 10).
- Akun admin yang bertanggung jawab; keputusan penerimaan/verifikasi tetap oleh admin.
- Apakah prioritas pertama tetap PPDB sebelum newsletter dan foto publik.

Panduan ini tidak membuat issue/branch protection secara otomatis, menjalankan
migration, mengubah backend, atau melakukan deployment. PDF panduan tim bertanggal
25 September 2026 dan ZIP lama adalah arsip, bukan acuan tugas versi terbaru.

## Referensi

- [Instalasi lokal](../PANDUAN-INSTALASI.md)
- [Struktur frontend](FRONTEND_STRUCTURE.md)
- [Kontrak API](../contracts/README.md)
- [OpenAPI target](../contracts/openapi.yaml)
- [Fondasi backend](../backend/README.md)
