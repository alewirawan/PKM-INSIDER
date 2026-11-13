# Konten SMP Nurul Huda Cisoka

Pembaruan 13 November 2026 menggunakan informasi sekolah dan foto yang disediakan
pengelola project. Sumber foto asli disimpan lokal di `images/` dan tidak ikut
repository; salinan yang digunakan website ada di `frontend/public/images/sekolah/`.

## Lokasi pengelolaan

| Bagian | Lokasi |
| --- | --- |
| Identitas, koordinat, visi/misi, 16 nama guru, tujuh ekstrakurikuler, artikel awal | `contracts/school-profile.json` |
| Teks beranda dan sejarah | `frontend/app/lib/content/home.ts`, `about.ts` |
| Layout beranda, Tentang, PPDB | `frontend/app/page.tsx`, `tentang/page.tsx`, `pendaftaran/page.tsx` |
| Peta dan galeri kegiatan | `frontend/app/components/SchoolMap.tsx`, `SchoolEventGallery.tsx` |
| Foto yang dapat dipilih admin | `schoolImageOptions` di `frontend/app/data.ts` |
| Pengisian konten awal database | `backend/src/db/seed-school.ts` |
| Perubahan struktur database | `backend/drizzle/0003_school_profile.sql`, `0004_organization_hierarchy.sql` |
| Kontrak API | `contracts/openapi.yaml` versi 1.5.0 |

Setelah database terisi, ubah kontak, guru, organisasi, ekstrakurikuler dan artikel
melalui dashboard admin. Mengedit JSON tidak menimpa database yang sudah diisi.
Teks sejarah, visi/misi, koordinat peta dan galeri foto artikel saat ini dikelola
melalui source file di atas. Galeri terhubung dengan slug
`semangat-kemerdekaan-17-agustus`; jika slug diubah, sesuaikan sumber galeri juga.

## Pemilihan foto

Tema visual menggunakan biru tua, biru utama dan latar biru muda. Nilai warna
berada di `frontend/app/styles/base.css` (`--brand-blue`, `--brand-navy`,
`--surface-blue`). Penyesuaian tata letak dan komponen tema berada di
`frontend/app/styles/blue-theme.css`, diimpor terakhir oleh `globals.css`.
Gunakan variabel warna tersebut ketika menambahkan komponen baru.

| File | Penempatan dan alasan |
| --- | --- |
| `gedung-sekolah.jpeg` | Hero beranda dan preview tautan; gedung jelas, pencahayaan terang. |
| `halaman-sekolah.jpeg` | Sejarah, pengalaman belajar, halaman login; memperlihatkan ruang kelas dan halaman. |
| `warga-sekolah.jpeg` | Foto pendamping beranda; format lebar dipertahankan agar kelompok tidak terpotong. |
| `17-agustus-bersama.jpeg` | Sampul artikel; dekorasi merah-putih dan kebersamaan menjadi fokus. |
| `17-agustus-bendera.jpeg` | Galeri vertikal pembawa bendera. |
| `17-agustus-lapangan.jpeg` | Galeri suasana kegiatan di lapangan. |
| `kegiatan-halaman.jpeg` | Galeri foto lebar untuk variasi sudut kegiatan. |
| `brosur-ppdb.jpeg` | Tautan brosur pada PPDB; sumber visi, misi, kegiatan dan persyaratan. |

Foto asli tidak diubah. Salinan publik tidak mengandung tag EXIF/GPS.

## Perilaku Docker dan database

Perintah menjalankan project tetap mengikuti `PANDUAN-INSTALASI.md`. Saat backend
mulai, urutannya adalah migration, pemeriksaan database, pengisian konten sekolah,
lalu server development. Pengisian konten mencatat penanda versi dalam audit events
dan dijalankan dalam transaksi. Restart berikutnya melewati pengisian tersebut.

- Database baru mendapat profil sekolah, 16 guru, tujuh kegiatan dan satu artikel terbit.
- Pengaturan template lama hanya diganti bila alamat dan email masih persis penanda awal.
- Pengaturan yang sudah diubah admin dipertahankan. Nama guru/klub/artikel menggunakan ID stabil.
- Akun admin, pendaftar dan prestasi tidak dibuat oleh pengisian konten sekolah.
- Pengaturan PPDB awal terbuka sepanjang tahun ajaran; admin tetap bisa menutupnya secara manual.
- Berkas wajib awal: SKL, rapor, akta, KK, KTP orang tua. Ijazah boleh menyusul;
  PIP/KIP jika memiliki. Pasfoto tersedia sebagai unggahan opsional; brosur meminta
  dua lembar pasfoto 3×4 berlatar biru untuk penyerahan langsung.
- Pendaftaran lama mendapat slot rapor dan pasfoto tanpa perubahan persyaratan yang
  tersimpan saat mendaftar. `photo` lama tetap dapat dibaca, bukan jenis unggahan baru.
- Migration tidak menghapus volume, akun atau berkas lama. Jangan memakai `down -v`.

Untuk menjalankan tanpa Docker, jalankan `db:migrate` kemudian `db:seed:school`
dari workspace backend dengan database lokal yang sudah dikonfigurasi. Script
pengisian konten sekolah dibatasi untuk development lokal; deployment production
memerlukan rencana migrasi tersendiri.

Drizzle CLI di workspace root memerlukan `drizzle-orm` yang dapat di-resolve dari
root. Dependensi development root disertakan dalam lockfile. Gunakan `npm ci`
atau build Docker, dan pertahankan deklarasi tersebut ketika memperbarui dependensi.

## Informasi yang belum tersedia

Bagan organisasi telah diisi dari `images/Screenshot 2026-11-13 at 12.40.31.png`
setelah dikonfirmasi pemilik project: 11 pengelola dan dua unit tanpa nama orang
(Wali Kelas, Guru Bidang Studi). Bidang guru mengikuti daftar terbaru tanggal 13 November 2026. Hasan memakai
gelar S.Pd dan Hajar Bayani Ammri mengikuti koreksi terbaru pada daftar tersebut.
Tata Usaha dan Operator ditampilkan sebagai tugas kependidikan. Masa mengajar
dan foto per orang belum tersedia; direktori menggunakan inisial.

Di **Struktur & guru → Edit profil**, pilih **Terhubung ke jabatan** untuk menentukan
induk dan **Jenis hubungan** untuk memilih struktur atau koordinasi. Komite
menggunakan koordinasi dengan Kepala Sekolah. Data `level` adalah kategori editor;
posisi bagan mengikuti `parentId`. Hubungan berputar atau induk yang tidak ada ditolak.
Menghapus jabatan dari editor membuat bawahan langsung menjadi posisi paling atas,
sehingga profil lain tidak ikut hilang; hubungkan kembali melalui Edit profil.

Pengisian awal organisasi ditangani `backend/src/db/seed-organization.ts` dengan
penanda audit terpisah. Bagan yang sudah dikelola admin tidak ditimpa, dan restart
tidak mengembalikan jabatan yang sudah diubah atau dihapus. Pembuatan akun admin
tetap terpisah dari pengisian konten; password tidak masuk source atau seed.

Tahun kegiatan 17 Agustus belum diketahui. Artikel tidak mengklaim tahun kegiatan;
tanggal 13 November 2026 adalah tanggal publikasi. Nomor telepon/WhatsApp dan URL
Facebook resmi belum diberikan; nomor palsu dan tautan akun tebakan tidak digunakan.
Nama kontak PPDB mengikuti informasi yang diterima: Pak Humaidi dan Bu Jannah.
Daftar guru menggunakan ejaan Bpk. Humaedi sesuai daftar sumber.

Data prestasi dan jadwal kegiatan yang belum dikonfirmasi dibiarkan kosong.
Klaim akreditasi dan peringkat Gugus 5 mengikuti keterangan profil dari sekolah;
perbarui teks bila sekolah memberikan dokumen atau data yang lebih baru.

## Pemeriksaan

`npm run check` memeriksa frontend/backend; `npm run build` memeriksa build.
`tests/browser/school-content.spec.ts` memeriksa halaman publik dan formulir tanpa
mengirim pendaftaran. Tes database terpisah ada di
`backend/tests/school-profile.test.ts` dan `backend/tests/full-system.test.ts`;
jangan arahkan variabel database test ke database kerja.


## Kanvas struktur dan formulir PPDB

- `frontend/app/components/school-directory/OrganizationWorkspace.tsx`: pilihan 2D/3D/Daftar, pencarian peran, detail hubungan, dan kontrol kanvas.
- `organization-layout.ts` di folder yang sama: menghitung posisi dari `parentId`, termasuk koordinasi dan banyak akar. Penambahan/penghapusan jabatan tidak memakai jumlah kolom tetap.
- `organization-scene.ts`: DOM untuk mode 2D dan Three.js CSS3DRenderer dengan kamera ortografis untuk 3D; merender saat interaksi atau ukuran layar berubah. Tidak ada animasi berjalan terus-menerus.
- `frontend/app/styles/directory/organization-workspace.css`: gaya kanvas dan daftar responsif.
- `frontend/app/components/ExtracurricularPicker.tsx` dan `styles/public/admission-refinement.css`: kartu pilihan, checkbox 18px, serta ruang klik minimum 44px.
- `frontend/app/components/registration/LiveRegistrationForm.tsx`: langkah formulir, fokus keyboard saat berpindah langkah, dan penghormatan reduced motion.

Mode Daftar menyediakan informasi yang sama tanpa transformasi perspektif, termasuk
saat menggunakan zoom browser atau pembaca layar. Mode geser kanvas harus diaktifkan
secara eksplisit sehingga guliran halaman tidak langsung tertahan di kanvas.

Bidang guru tersimpan di `contracts/school-profile.json`. `backend/src/db/seed-teacher-subjects.ts`
mengganti label lama yang masih umum satu kali, memperbarui dua ejaan lama yang cocok,
dan mencatat penanda audit. Nilai bidang yang sudah disunting admin dipertahankan.
Restart berikutnya tidak mengulang perubahan.

Untuk perubahan dependensi frontend dengan bind mount Docker, siapkan dependency image
sebelum membuka preview. Perubahan source dapat langsung terbaca container lama, sehingga
impor paket baru belum tersedia sampai container memakai image yang sudah dibangun ulang.

Saat memperbarui ejaan data awal, cocokkan variasi tanda baca lama secara eksplisit
dan uji dengan data yang sudah terpasang. Jangan menimpa seluruh direktori hanya
untuk memperbarui beberapa bidang. Tunggu `docker compose ... up --wait` selesai
sebelum menjalankan tes browser agar hasil tidak dipengaruhi cold start.


Pembaruan kanvas: tampilan awal desktop memperlihatkan seluruh struktur; mobile
memakai daftar. Memilih kartu hanya mengubah detail dan sorotan garis, sedangkan
pilihan peran pada dropdown memindahkan pandangan. Mode/resize mempertahankan zoom
manual. Geser memiliki ambang 6px dan batas posisi, sehingga drag tidak dianggap
klik dan pengguna tidak tersesat jauh dari bagan. Ctrl + scroll hanya ditangani
ketika mode geser aktif. Daftar tetap tersedia jika modul Three.js gagal dimuat.
Mode 2D memakai DOM tanpa kamera, sehingga tidak bergantung pada transformasi
CSS3D saat browser diperbesar. CSS3DRenderer memiliki batasan zoom browser 100%;
untuk zoom browser gunakan 2D atau Daftar sesuai [dokumentasi Three.js](https://threejs.org/docs/pages/CSS3DRenderer.html).

Untuk regression check kanvas, uji bahwa klik kartu tidak mengubah zoom; ganti
2D/3D berulang, resize setelah zoom manual, drag dari kartu tanpa memicu pemilihan,
dan uji fallback modul gagal. Keberadaan tombol saja tidak membuktikan interaksi
berfungsi. Jangan memanggil fit/focus secara implisit dari efek pemilihan.
