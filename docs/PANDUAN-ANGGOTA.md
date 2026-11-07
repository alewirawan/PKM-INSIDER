# Mulai bekerja sebagai anggota tim

Mulai dari satu menu dan satu perubahan kecil. Tidak perlu memahami seluruh
project untuk mengerjakan tugas pertama. Pembagian fitur tetap mengikuti
[panduan tim](README-TIM-PKM.md); panduan ini membantu menjalankannya secara bertahap.

## Hari pertama

1. Ikuti [instalasi Docker](../PANDUAN-INSTALASI.md), lalu jalankan frontend,
   backend, dan database bersama dari root project.
2. Buka `http://localhost:3000`, lalu `/admin`. Buat akun admin lokal dengan
   perintah pada panduan instalasi sebelum login.
3. Coba menu milikmu dengan data fiktif. Catat satu masalah atau kebutuhan kecil.
4. Buka file awal pada tabel di bawah. Cari teks yang terlihat pada menu untuk
   menemukan bagian tampilan yang sesuai.
5. Bersama reviewer, pilih satu hasil yang bisa ditunjukkan. Buat kartu tugas
   sebelum mengubah kode.

Database setiap komputer berbeda. Docker menghubungkan frontend ke API secara
otomatis. Modul yang masih berupa simulasi tetap menyimpan data di browser;
tersedianya database tidak otomatis menyelesaikan integrasi seluruh menu.

## Latihan pertama untuk setiap anggota

Tabel ini adalah titik mulai, bukan pengganti seluruh tanggung jawab anggota.
Uji perilaku yang sudah ada dahulu. Bila sudah benar, catat hasilnya dan pilih
satu kasus uji atau perbaikan kecil berikutnya; jangan membuat komponen duplikat.
Semua path relatif terhadap root project dan sudah tersedia.

| Anggota | Latihan awal                                                                 | File pertama                                                        | Bukti yang dibawa saat review                                                   |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1       | Periksa teks profil dan keterbacaan halaman Tentang pada ponsel              | `frontend/app/tentang/page.tsx`                                     | Screenshot desktop/ponsel dan satu perbaikan jika ditemukan masalah             |
| 2       | Coba menambah kegiatan demo, lalu nonaktifkan dan periksa daftar publik      | `frontend/app/components/admin/ClubsModule.tsx`                     | Langkah uji dan hasil pada menu Program                                         |
| 3       | Coba tambah, edit, dan ubah urutan satu guru fiktif                          | `frontend/app/components/school-directory/DirectoryTeachersTab.tsx` | Hasil di admin serta tab guru pada `/struktur`                                  |
| 4       | Coba artikel berstatus draft dan terbit                                      | `frontend/app/components/admin/PostsModule.tsx`                     | Bukti draft tidak tampil pada daftar Blog publik                                |
| 5       | Uji pesan kesalahan saat memilih berkas dengan tipe/ukuran tidak sesuai      | `frontend/app/components/registration/DocumentFields.tsx`           | Pesan yang muncul dan form masih bisa dilanjutkan setelah berkas diperbaiki     |
| 6       | Coba pencarian nama fiktif dan pencarian tanpa hasil                         | `frontend/app/components/StudentRecordsModule.tsx`                  | Hasil pencarian, keadaan kosong, dan detail siswa yang dipilih                  |
| 7       | Telusuri pratinjau berkas demo sebelum dan sesudah refresh                   | `frontend/app/components/student-records/DocumentReview.tsx`        | Penjelasan mengapa nama file tidak membuktikan berkas sudah tersimpan di server |
| 8       | Coba prestasi dipublikasikan dan disembunyikan                               | `frontend/app/components/admin/AchievementsModule.tsx`              | Hasil pada `/prestasi` sesuai status publikasi                                  |
| 9       | Jalankan test backend dan telusuri penolakan form login tidak lengkap        | `backend/tests/app.test.ts`                                         | Dapat menjelaskan input, status 422, dan mengapa test tidak memerlukan database |
| 10      | Dampingi instalasi di komputer satu anggota dan jalankan pemeriksaan project | `package.json`                                                      | Catatan kendala serta hasil perintah; bukan hanya berhasil di komputer sendiri  |

Setelah latihan, pilih satu perbaikan kecil berdasarkan temuan. Anggota 9 dan 10
tetap perlu pendampingan saat mulai konfigurasi database atau keamanan. Nomor
anggota menunjukkan penanggung jawab fitur, bukan keharusan bekerja sendirian.

## API dalam project ini

API adalah jalur pertukaran data antara tampilan website dan server. Contohnya,
ketika admin menyimpan guru, target akhirnya adalah data tersimpan di database,
bukan hanya di browser admin tersebut.

Alur targetnya: form admin → permintaan API → pemeriksaan server → database →
jawaban ke tampilan. Daftar guru publik kemudian membaca data melalui API.
Alur guru ini belum diimplementasikan; yang tersedia sekarang masih simulasi.

| Istilah     | Arti praktis                                                     |
| ----------- | ---------------------------------------------------------------- |
| Endpoint    | Alamat untuk satu layanan, misalnya `/api/v1/health`             |
| GET         | Membaca data                                                     |
| POST        | Mengirim data baru atau menjalankan tindakan tertentu            |
| PATCH / PUT | Mengubah data sesuai aturan endpoint                             |
| Request     | Permintaan yang dikirim tampilan ke server                       |
| Response    | Jawaban server: data atau pesan kesalahan                        |
| JSON        | Bentuk teks terstruktur untuk data; berbeda dengan file unggahan |
| Kontrak     | Kesepakatan alamat, nama field, bentuk data, dan hak akses       |

`contracts/openapi.yaml` adalah kontrak API project, bukan layanan percakapan.
Label `planned` berarti endpoint masih harus dibuat. Tidak perlu membaca semua
YAML sekaligus: buka hanya operasi milik tugasmu bersama reviewer.

Contoh yang sudah memiliki kode adalah pemeriksaan kesehatan server di
`backend/src/modules/health/health.routes.ts`. Test-nya berada di
`backend/tests/app.test.ts`. Dari root project:

```bash
npm run test --workspace=@nurul-huda/backend
```

Test yang tersedia memakai server di dalam proses pengujian. Keberhasilan test
health bukan bukti koneksi database atau login nyata sudah berhasil.
Setup server dan database dijelaskan terpisah di [panduan backend](../backend/README.md).

## Pisahkan satu fitur menjadi beberapa tugas

Jangan memberi satu kartu berjudul “selesaikan semua backend guru”. Pecah
pekerjaan, misalnya pada Struktur dan Guru, menjadi:

1. **Tampilan:** periksa kartu guru, edit form, dan tampilan kosong pada demo.
2. **Baca data:** buat bagian baca direktori dari database dan test-nya sesuai
   kontrak `GET /directory`. Ini tugas baru, bukan endpoint yang sudah berjalan.
3. **Sambungkan tampilan:** gunakan jawaban API pada komponen guru; siapkan
   loading, data kosong, dan pesan gagal. Jangan diam-diam kembali ke data demo.
4. **Simpan perubahan:** implementasikan perubahan direktori sesuai kontrak
   `PUT /directory`, dengan validasi dan izin admin.
5. **Uji bersama:** simpan dari admin, buka halaman publik, refresh, lalu pastikan
   akses tanpa izin ditolak. Periksa juga kemungkinan menimpa perubahan orang lain.

Satu kartu dikerjakan sampai dapat direview sebelum mengambil kartu berikutnya.
File baru dan pemilik modul mengikuti [panduan tim](README-TIM-PKM.md), bukan
dibuat menurut nama anggota.

Pemula dapat mengerjakan tampilan dan kasus uji sambil didampingi. Untuk tahap
API, kerjakan satu contoh baca data bersama dahulu, kemudian gunakan pola yang
sama pada fitur lain. Jika belum ada anggota yang memahami autentikasi atau
penyimpanan berkas, minta review dosen/pendamping teknis sebelum menggunakan data
pendaftar nyata atau menyiapkan production.

## Isi kartu tugas sebelum coding

Template tersedia di [.github/ISSUE_TEMPLATE/tugas.md](../.github/ISSUE_TEMPLATE/tugas.md).
Koordinator dan anggota mengisi bersama:

- Tujuan: satu perilaku yang dapat dicoba, bukan “rapikan semuanya”.
- Pemilik dan reviewer: nama orang yang mengerjakan dan memeriksa.
- Mode: simulasi tampilan atau integrasi server.
- File: file yang sudah ada dan file baru yang memang dibutuhkan.
- API: alamat, input, hasil, serta akses yang disalin dari kontrak terkait.
  Untuk tugas tampilan saja, isi “tidak digunakan”.
- Batas: bagian yang tidak boleh ikut berubah.
- Uji: langkah mencoba dan hasil yang diharapkan.

Jika bagian API belum dipahami atau endpoint belum tersedia, tandai sebagai
ketergantungan dan bahas dengan pemiliknya. Jangan menebak nama field, menambah
endpoint sendiri, atau mengubah kontrak hanya agar error hilang.

Contoh kartu kecil:

```text
Judul: A3 memeriksa tampilan daftar guru kosong pada ponsel
Pemilik: nama anggota 3
Reviewer: nama anggota 4
Mode: simulasi
File awal: frontend/app/components/TeacherDirectory.tsx
API: tidak digunakan
Batas: tidak mengubah schema database, login, atau editor struktur organisasi
Uji: daftar normal, daftar kosong, layar 390 px, dan desktop
Hasil: pesan kosong terbaca, tidak ada scroll horizontal atau error
```

Gunakan browser/profil demo terpisah jika pengujian menghapus data contoh.
Jangan menghapus data kerja anggota lain.

## Menyerahkan perubahan

Ikuti [langkah Git](README-TIM-PKM.md#langkah-git-per-anggota). Satu tugas memakai
satu branch dan satu pengajuan perubahan atau pull request (PR). Jangan membuat
ulang folder project, mengganti framework, atau mengubah file milik anggota lain
tanpa koordinasi.

Sebelum mengajukan PR, dari root project jalankan:

```bash
npm run check
git diff --check
git diff
git status --short
```

`npm run check` menjalankan lint, pemeriksaan tipe, dan test. Test frontend juga
melakukan build frontend. Jika mengubah backend, jalankan tambahan:

```bash
npm run build --workspace=@nurul-huda/backend
```

Perubahan kontrak memiliki [pemeriksaan tersendiri](../contracts/README.md).
Pemeriksaan otomatis tidak menggantikan mencoba menu pada browser.

Periksa daftar file sebelum commit. Jangan ikutkan `.env`, dokumen siswa asli,
ZIP, `node_modules`, hasil build, atau catatan pribadi. Gunakan
[template PR](../.github/pull_request_template.md) untuk menjelaskan perubahan,
cara mencoba, hasil test, dan hal yang belum selesai. Template GitHub akan
tersedia setelah file template masuk ke branch default repository.

Saat review, pemilik harus dapat menjawab:

1. File mana yang diubah dan mengapa?
2. Data berasal dari mana dan disimpan di mana?
3. Apa yang terjadi jika input salah atau permintaan gagal?
4. Bagaimana membuktikan perubahan berhasil tanpa merusak menu lain?

Tugas tampilan dapat selesai tanpa database jika kartunya memang hanya mencakup
tampilan. Fitur integrasi belum selesai jika masih memakai data browser. Tuliskan
batas pengujian dengan jelas, lalu gabungkan setelah reviewer menyetujui.

## Penulisan kode dan dokumentasi

Gunakan nama fungsi dan variabel yang menjelaskan tujuan. Komentar cukup untuk
alasan teknis yang tidak jelas dari kodenya; petunjuk pengerjaan berada di
dokumentasi atau kartu tugas. Pertahankan lisensi dan penanda teknis yang diperlukan.
README berisi fungsi project, instalasi, status fitur, dan navigasi dokumentasi.
Hindari catatan percakapan, cerita proses penulisan, atau klaim fitur yang belum diuji.
