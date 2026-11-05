# Kontrak integrasi SMP Nurul Huda

Revisi 1.2.0, 15 Oktober 2026. [openapi.yaml](openapi.yaml) adalah target request,
response, akses, dan validasi untuk implementasi tim. Fondasi backend hanya
memiliki auth dan health; resource lain berstatus planned. Kontrak tidak
menjalankan database, migration, atau upload.

Pembagian path dan pemilik ada di [panduan tim](../docs/README-TIM-PKM.md).
Jika belum terbiasa dengan API, baca [Panduan Anggota](../docs/PANDUAN-ANGGOTA.md)
terlebih dahulu, lalu pelajari hanya operasi yang berkaitan dengan tugasmu.
Setiap operasi memiliki x-owner. x-implementation-status membedakan foundation
dari planned; x-roles adalah aturan yang harus ditegakkan server, bukan otorisasi
yang otomatis berjalan karena ditulis di YAML.

## Perubahan dari kontrak lama

- Pilihan pendaftaran menggunakan extracurriculars berupa daftar opsional, bukan program atau satu extracurricular.
- Upload baru memiliki enam jenis: skl, ijazah, kk, ktp, kip, akta.
- photo tetap dibaca sebagai metadata lama, bukan pilihan upload baru.
- Status dokumen: Belum ada, Menunggu pemeriksaan, Terverifikasi, Perlu perbaikan.
- Review memiliki catatan serta pemeriksa/waktu yang ditentukan server.
- PPDB publik menerima satu multipart berisi identitas dan berkas.
- API offline, daftar berkas, review, download, Prestasi, Ekstrakurikuler,
  daftar admin artikel/agenda, detail slug, dan ringkasan dashboard dicantumkan.
- Struktur organisasi boleh kosong; kepala sekolah maksimal satu.
- Penghapusan permanen pendaftar tidak termasuk tahap pertama.
- Respons Application/ContactMessage memiliki schema sendiri sehingga field
  respons tidak ditolak oleh additionalProperties=false pada schema input.

## Mapping data

| Data             | Frontend simulasi                        | API target dan pekerjaan integrasi                                              |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| Pilihan kegiatan | extracurricular berupa nama              | extracurriculars berupa array nama aktif. Kosong = []; field lama tidak dikirim |
| Identitas        | id berupa NH-...                         | id API nomor pendaftaran unik server; UUID database internal                    |
| Sumber           | registrationSource                       | source dalam respons; server menentukan Website/Offline                         |
| Jenis dokumen    | key                                      | kind; mapper dokumen milik 7                                                    |
| Dokumen lama     | Diunggah                                 | Mapper mengubah ke Menunggu pemeriksaan                                         |
| File dipilih     | File dalam memori                        | multipart; tidak dikirim sebagai base64/JSON                                    |
| File contoh      | fileName dapat berupa nama fiktif        | Tidak diimpor sebagai bukti file; hasFile ditentukan storage server             |
| Berkas fisik     | Checklist offline                        | receivedDocumentKinds pada request, receivedPhysically pada metadata            |
| Agenda           | Belum ada visibilitas pada model UI      | Tambahkan kontrol Publik/Internal saat integrasi anggota 2                      |
| Error            | ApiError hanya membawa message/requestId | Anggota 10 mengembangkan parsing errors per field bersama pemilik form          |

Nama kegiatan wajib unik setelah trim dan normalisasi kapital. Simpan snapshot
nama pada pendaftaran; rename/nonaktif tidak mengubah pilihan lama. Saat edit,
pilihan historis yang tidak diubah tetap sah; pilihan baru harus aktif. Migrasi ke
ID kegiatan bukan bagian kontrak ini dan harus disepakati sebelum perubahan.
Belum menentukan pada mockup lama dipetakan ke []; satu nama dipetakan ke [nama].
Frontend online/offline perlu multiselect; field extracurriculars boleh tidak
ada pada request (server memakai []), tetapi selalu berupa array pada respons.

Client tetap berada di frontend/app/lib/api/ per fitur yang direncanakan. Jangan
mengubah seluruh mockup ke API dalam satu PR. Aktifkan URL API hanya ketika modul
yang digunakan siap; kegagalan API ditampilkan sebagai error, bukan seed demo.

## Submit PPDB publik

Target: POST /api/v1/applications, Content-Type multipart/form-data.

Bagian data berisi objek JSON sesuai ApplicationCreate, dengan content type
application/json. Bagian file memakai nama skl, ijazah, kk, ktp, kip, akta.
Saat menggunakan FormData browser, jangan menetapkan header Content-Type
multipart secara manual karena boundary harus dibuat browser.

Rancangan validasi tahap awal:

- Berkas wajib mengikuti documentRequirements yang diatur admin, bukan daftar tetap.
- requiredKinds mewajibkan seluruh jenis yang dipilih; requireOneGraduationDocument
  mengatur apakah minimal salah satu SKL/ijazah diperlukan.
- PIP/KIP selalu opsional dan tidak dapat dipilih sebagai berkas wajib.
- UI membaca settings terbaru; server memvalidasi aturan tersebut dan menyimpan
  snapshot pada pendaftaran. Perubahan settings berlaku untuk pendaftar baru.
- Maksimal 6 file; masing-masing maksimum 5 MiB atau 5.242.880 byte.
- JSON maksimum 16 KiB; keseluruhan request maksimum 32 MiB.
- PDF/JPG/PNG diperiksa signature, ukuran, dan jumlahnya di server.
- Field data diperiksa dari schema; unknown field ditolak.
- Tidak ada batas usia atau syarat kelayakan tambahan. Tanggal lahir tetap
  harus berupa tanggal valid dan tidak berada di masa depan.

Anggota 5 memiliki route/orchestrasi submit, anggota 7 menyediakan service
validasi/storage. Server memvalidasi semua bagian, menulis file sementara, menyimpan
metadata dan file secara konsisten, lalu memberi 201 hanya sesudah berhasil.
Jika salah satu bagian gagal, jangan membuat pendaftaran seolah-olah lengkap.
Gunakan cleanup dan mekanisme pemulihan untuk file/database yang tidak memiliki
transaksi atomik bersama. Uji kegagalan sesudah write file maupun sebelum commit DB.

Header Idempotency-Key berisi UUID baru untuk satu submit logis. Retry atas isi
yang sama menggunakan key yang sama; hasil sukses disimpan selama 24 jam dan
mengembalikan bukti yang sama. Key sama dengan isi berbeda atau request masih
diproses ditolak 409. Kegagalan sebelum keberhasilan boleh dicoba lagi dengan
key yang sama. Pembatasan PPDB tidak membatalkan pembacaan hasil retry sukses.
Key tidak dicatat pada URL/log dan bukan token untuk mengakses biodata/berkas.

Receipt hanya berisi id, status, submittedAt; tidak memuat KK, NISN, atau URL file.
Tidak ada GET detail publik atau upload ulang dengan nomor pendaftaran saja.
Pendaftar memperbaiki berkas melalui area pribadi terautentikasi, kemudian admin
memeriksanya. Rancangan penerbitan dan pemulihan akses pendaftar adalah pekerjaan
anggota 9 sebelum endpoint koreksi boleh diaktifkan.
Terapkan rate limit, batas concurrent upload, kuota storage, serta pembersihan file
gagal; batas file pada UI saja tidak cukup.

Keputusan pengguna: berkas wajib dapat diatur; PIP/KIP opsional; jadwal manual;
tidak ada syarat usia/kelayakan tambahan; ekstrakurikuler boleh beberapa dan
opsional; keputusan penerimaan oleh admin; koreksi oleh pendaftar, diperiksa admin;
penyimpanan tanpa penghapusan otomatis. Ini target sistem, bukan fitur yang telah
berjalan atau pernyataan pengesahan formal oleh sekolah.

## Pengaturan manual dan masa simpan

registrationOpen adalah toggle admin untuk membuka/menutup pendaftaran baru.
registrationOpensAt dan registrationClosesAt adalah informasi tanggal yang diisi
manual, boleh null; keduanya tidak menjalankan scheduler. Jika keduanya terisi,
tanggal tutup harus setelah tanggal buka. Tampilan jadwal dan toggle harus jelas
agar admin tidak mengira tanggal otomatis mengubah status. Anggota 1 menangani UI,
9 menyimpan/validasi pengaturan; 5 memeriksa status saat submit.

documentRequirements disimpan sebagai snapshot untuk setiap pendaftar. Filter
kelengkapan dan syarat verifikasi memakai snapshot tersebut agar pendaftar lama
tidak tiba-tiba dianggap tidak lengkap ketika pengaturan baru diubah.

dataRetention=indefinite berarti data, berkas yang berhasil disimpan, dan versi
penggantiannya tidak dihapus otomatis. Tidak berarti bebas risiko kehilangan:
anggota 10 tetap menyiapkan kapasitas, backup, restore dan pemantauan storage.
File sementara dari submit gagal boleh dibersihkan karena belum menjadi arsip
pendaftaran. Tidak ada fitur purge massal pada tahap ini.

## Input offline dan data admin

POST /applications/offline menerima JSON ApplicationOfflineCreate dengan session
admin PPDB. Nomor unik dan source=Offline dibuat server; status awal Verifikasi.
receivedDocumentKinds menandai berkas fisik diterima, bukan digital terunggah atau
otomatis terverifikasi. Offline boleh dicatat saat berkas belum lengkap dan saat
PPDB publik ditutup; izin admin tetap wajib.

GET /applications memiliki pencarian, source, status, documents, cursor, dan limit.
Filter diterapkan sebelum pagination. API yang sama dipakai menu Pendaftar dan Data
siswa. Ekspor CSV frontend harus jelas apakah seluruh hasil atau halaman aktif;
jangan mengklaim seluruh hasil bila hanya mengambil halaman pertama.

GET/PATCH /applications/{applicationId} dimiliki anggota 6. Nomor/source/waktu
bukan field yang dapat diedit. Mapper dan schema pendaftaran milik 5; keduanya
tidak membuat tabel atau handler duplikat.

Aturan teknis transisi awal berikut masih perlu direview tim; keputusan menerima
atau menolak tetap dilakukan admin, bukan perhitungan otomatis:

- Verifikasi → Terverifikasi hanya bila semua berkas wajib sudah terverifikasi.
- Terverifikasi → Wawancara, Diterima, atau Ditolak.
- Wawancara → Diterima atau Ditolak.
- Mengulang status yang sama tidak membuat kejadian ganda.
- Membuka kembali keputusan ke Verifikasi memerlukan super_admin, alasan, dan audit.
- Transisi lain ditolak 409 sampai ada perubahan aturan yang disetujui.

Aturan ini adalah service target anggota 5 yang digunakan handler 6. Enum pada
OpenAPI tidak otomatis menegakkan transisi. Review file tidak otomatis mengubah
status penerimaan. Saat berkas diganti setelah keputusan, tampilkan kebutuhan
pemeriksaan ulang; perubahan keputusan tetap tindakan admin yang berhak.

## Berkas privat dan kelengkapan

GET /applications/{applicationId}/documents memberi metadata, bukan lokasi storage.
POST pada path yang sama hanya untuk admin, mengunggah/mengganti satu jenis.
PATCH /applications/{applicationId}/documents/{documentId} menyimpan review.
GET /applications/{applicationId}/documents/{documentId}/download memberi file.

hasFile=true berarti file digital benar-benar tersimpan. receivedPhysically=true
berarti berkas fisik tercatat diterima. File contoh dari mockup tidak boleh
dimigrasikan sebagai file nyata. Satu jenis memiliki satu slot aktif per pendaftar;
riwayat file lama dan pemeriksaannya diarsipkan internal tanpa purge otomatis.

Status menunggu/terverifikasi/perlu perbaikan memerlukan file atau bukti penerimaan
fisik. Review Perlu perbaikan wajib memiliki catatan tidak kosong. reviewedBy dan
reviewedAt diisi server, bukan dipercaya dari input pengguna. Penggantian digital
mereset review ke Menunggu pemeriksaan; versi lama yang sudah tersimpan tetap
diarsipkan tanpa purge otomatis.

Client review mengirim status dan reviewNote bersama pada setiap PATCH. Jika UI
hanya mengubah catatan atau status, gabungkan dengan nilai terbaru pasangannya
sebelum request. Jangan mengirim patch parsial langsung dari handler mockup.

Kelengkapan bukan jumlah file:

- Gunakan snapshot documentRequirements pendaftar: requiredKinds dan aturan
  minimal salah satu SKL/ijazah jika diaktifkan. Jika tidak ada jenis diwajibkan,
  tidak ada kekurangan berkas wajib.
- Dokumen memiliki file atau penerimaan fisik serta status Menunggu pemeriksaan
  atau Terverifikasi.
- Perlu perbaikan dan Belum ada tidak memenuhi kelengkapan.
- KIP dan photo lama tidak menentukan kelengkapan.
- Lengkap berbeda dengan seluruh berkas terverifikasi.

Download harus memeriksa role serta relasi documentId dengan applicationId pada
setiap request. Simpan di direktori privat dan jangan mengembalikan storageKey,
path disk, atau URL publik. Gunakan Cache-Control private, no-store dan nama
download aman. Metadata tetap privat meskipun isi file tidak diminta.

requestApi<T> saat ini membaca JSON. Anggota 7 membuat client download blob
terautentikasi dengan penanganan error; anggota 6 membuat objectURL dan revoke saat
preview ditutup. Jangan menaruh cookie/token di query URL atau localStorage.

## Perbaikan berkas oleh pendaftar

Target GET /applicant/application menampilkan status dan catatan berkas milik
pemegang session. Target PUT /applicant/documents/{kind} menerima file pengganti
miliknya sendiri. Tidak ada applicationId dari request yang dipercaya untuk
menentukan pemilik; identitas diambil dari session privat.

Session pendaftar terpisah dari admin. Cara login, penerbitan akses pertama untuk
online/offline, kedaluwarsa, logout, pemulihan, serta proteksi CSRF wajib dirancang
dan diuji anggota 9 bersama 5 sebelum implementasi endpoint ini. Kontrak menandai
x-auth-flow-status=design-required; ini pekerjaan tersisa, bukan login yang sudah
siap. Jangan menggunakan NISN, tanggal lahir, atau nomor pendaftaran sebagai satu-
satunya bukti identitas dan jangan menyimpan token pada URL/log/localStorage.

Berkas berstatus Perlu perbaikan atau Belum ada dapat dikirim oleh pemiliknya.
Berkas Terverifikasi terkunci sampai admin meminta perbaikan. Setelah penggantian,
status kembali Menunggu pemeriksaan, catatan lama diarsipkan, dan admin melakukan
verifikasi ulang. Pendaftar tidak dapat mengatur status verifikasi/penerimaan.
Koreksi tetap dapat dilakukan saat pendaftaran baru ditutup. Tidak ada download
berkas pendaftar lain, path storage, atau nama pemeriksa di respons pendaftar.

Anggota 5 membuat halaman pribadi, 7 menyediakan API file, 9 menyiapkan akses,
6 memastikan berkas baru tampil di admin. Tambahan ini menambah beban anggota 9;
pecah menjadi issue kecil dengan pendampingan 5 dan review 10.

## Akses per fitur

| Operasi                                                                  | Publik          | super_admin     | admin_ppdb      | editor          |
| ------------------------------------------------------------------------ | --------------- | --------------- | --------------- | --------------- |
| Konten terbit, direktori, kegiatan aktif, agenda publik, settings publik | Baca            | Baca            | Baca            | Baca            |
| Submit PPDB dan pesan                                                    | Submit terbatas | Submit terbatas | Submit terbatas | Submit terbatas |
| Data calon siswa, offline, berkas privat, review                         | Tidak           | Ya              | Ya              | Tidak           |
| Kelola artikel, direktori, agenda, prestasi, klub, pesan                 | Tidak           | Ya              | Tidak           | Ya              |
| Simpan settings dan ringkasan lintas domain                              | Tidak           | Ya              | Tidak           | Tidak           |
| Cek session/logout                                                       | Tidak           | Session sendiri | Session sendiri | Session sendiri |

Anggota 9 menyediakan guard; setiap pemilik memasangnya pada route. Pembatasan
role di tabel adalah baseline tim yang dikonfirmasi sekolah. Proteksi cookie,
CSRF, pembatasan request, dan audit harus diuji di backend. CORS serta tombol yang
disembunyikan bukan pengganti izin akses.

Draft artikel/prestasi, klub nonaktif, dan agenda Internal hanya tersedia pada
endpoint admin. Filter publik tidak boleh bisa diubah menjadi akses draft dengan
query. Upload foto publik dan newsletter termasuk tahap lanjutan, terpisah dari
berkas pendaftar privat.

## Status error dan pengujian

- 401: tidak ada session valid pada endpoint privat.
- 403: role tidak diizinkan atau pendaftaran publik ditutup.
- 404: data/file tidak ditemukan; draft artikel juga 404 pada detail publik.
- 409: konflik nomor/nama/slug, transisi, review, atau idempotency.
- 413/415: batas request atau jenis file ditolak.
- 422: validasi data gagal; tampilkan errors per field jika diberikan.
- 429: rate limit; ikuti Retry-After.
- 503: penyimpanan sementara gagal; jangan menampilkan sukses.

Uji minimum kontrak: field program/extracurricular lama ditolak, extracurriculars
boleh kosong/lebih dari satu, duplikat pilihan ditolak, enam jenis upload valid,
photo baru ditolak, kosong/lebih besar dari batas ditolak, KIP tidak dapat menjadi
wajib, review tanpa bukti ditolak, dan direktori boleh kosong tetapi maksimal satu
kepala sekolah. Kelengkapan berkas bersifat dinamis sehingga validasi HTTP harus
diuji terhadap konfigurasi dan snapshot kebijakan, bukan schema multipart saja.
Uji respons lengkap Application/ContactMessage agar schema input tidak menolak
field server. Test perilaku keamanan dan penyimpanan nyata tetap tugas implementasi.

Validasi struktur OpenAPI dapat dijalankan dari root tanpa mengubah dependency:

```bash
npm exec --yes --package=@redocly/cli -- redocly lint contracts/openapi.yaml --extends=minimal
npm exec --yes --package=ajv-cli -- node contracts/tests/schema.cjs
```

Validator dapat diunduh saat pertama dijalankan. Pemeriksaan schema bukan bukti
endpoint sudah diimplementasikan. Pemilik fitur menambah test backend/frontend
saat mulai implementasi. Koordinator meninjau perubahan kontrak sebelum integrasi
dan menjalankan quality gate project sebelum merge.

Test schema memakai dependency parser/format yang tersedia setelah npm ci dan
validator terisolasi dari npm exec; tidak menambah dependency aplikasi. Test
mencakup kasus valid/invalid serta pemeriksaan referensi dan pemilik operasi.
Signature/ukuran byte berkas HTTP, transaksi, idempotency, dan izin akses nyata
tetap memerlukan test implementasi. Warning server localhost pada lint OpenAPI
sesuai target development; jangan mengubahnya menjadi domain production fiktif.

Saat meregenerasi YAML melalui script, hindari interpolasi shell untuk teks yang
memuat $ref atau regex. Baca data dari file atau gunakan heredoc literal. Setelah
perubahan, parse ulang, tolak key kosong, periksa seluruh referensi lokal, lalu
uji contoh request dan response yang valid maupun invalid. Diff saja tidak
membuktikan referensi schema masih utuh.
