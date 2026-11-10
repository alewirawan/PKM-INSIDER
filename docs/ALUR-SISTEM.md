# Alur sistem dan pengelolaan sekolah

Versi PKM-INSIDER, 10 November 2026. Jalankan sesuai [panduan instalasi](../PANDUAN-INSTALASI.md).

## Akun dan hak akses

| Akun | Hak akses |
| --- | --- |
| super_admin | Seluruh menu, pengaturan sekolah, PPDB, dan ringkasan dashboard. |
| editor | Struktur/guru, artikel, prestasi, ekstrakurikuler, agenda, dan pesan. Tidak dapat membuka biodata/berkas pendaftar. |
| admin_ppdb | Pendaftar, data siswa, biodata, dokumen, status penerimaan, dan tautan pemulihan pendaftar. |
| Pendaftar | Data dan berkas miliknya sendiri melalui `/pendaftar`. |

Admin dibuat lewat perintah `admin:create`; tidak ada akun/password bawaan.
Menu menyesuaikan role. Backend tetap memeriksa izin pada setiap permintaan.
Sesi terpisah untuk admin dan pendaftar, berlaku 12 jam secara default.

## Pengaturan awal

1. Login `/admin` sebagai super_admin.
2. Di Pengaturan, isi nama, tagline, alamat dan kontak sekolah.
3. Tentukan tahun ajaran, berkas wajib, dan aturan minimal SKL/ijazah.
4. Tanggal pembukaan/penutupan bersifat informasi. Toggle PPDB menentukan buka/tutup secara manual.
5. Simpan. Website mengambil pengaturan dari server.

Pengaturan awal memakai kontak contoh dan PPDB ditutup. Ganti sebelum dipakai sekolah.
Narasi Beranda/Tentang/Program berada di `frontend/app/lib/content/` dan `frontend/app/data.ts`;
belum berupa editor halaman bebas. Foto bawaan merupakan ilustrasi/contoh, bukan dokumentasi resmi.

## Konten website

- **Struktur & guru:** tambah, ubah, hapus, dan pindah tingkat jabatan. Struktur boleh kosong atau tanpa salah satu tingkat; kepala sekolah maksimal satu. Potret dipilih dari contoh yang tersedia.
- **Artikel & berita:** buat draft, isi paragraf, kategori, penulis, gambar dan tanggal, kemudian terbitkan. Hanya artikel Terbit yang muncul publik.
- **Ekstrakurikuler:** kelola nama dan deskripsi; nonaktifkan jika tidak lagi tersedia. Pilihan lama siswa tetap menyimpan nama saat mendaftar.
- **Agenda:** tentukan Publik atau Internal. Agenda Internal tidak ditampilkan di website publik.
- **Prestasi sekolah:** isi penghargaan, tingkat, tahun, kategori, deskripsi dan gambar; aktifkan publikasi.
- **Pesan masuk:** pesan form Kontak tersimpan di database. Tandai Dibaca/Selesai atau hapus melalui konfirmasi. Jawaban dilakukan melalui kanal kontak sekolah; sistem tidak mengirim email otomatis.
- **Newsletter:** menyimpan alamat dan persetujuan berlangganan. Belum mengirim kampanye email.

## Pendaftaran melalui website

1. Buka `/pendaftaran` saat PPDB dibuka.
2. Isi data siswa dan orang tua/wali. NISN 10 angka. Ekstrakurikuler boleh lebih dari satu atau dikosongkan.
3. Buat password minimal 12 karakter untuk portal pendaftar.
4. Lampirkan SKL, ijazah, KK, KTP orang tua, PIP/KIP jika punya, dan akta sesuai persyaratan. Setiap berkas PDF/JPG/PNG maksimal 5 MiB.
5. Tinjau kembali, setujui penggunaan data, lalu kirim.
6. Simpan nomor NH-… dan password. Nomor dibuat server setelah penyimpanan berhasil.

Jika koneksi gagal, isian tetap ada selama halaman tidak dimuat ulang. Pengiriman ulang
isi yang sama memakai kunci pengiriman yang sama sehingga tidak menghasilkan pendaftar ganda.
Berkas wajib mengikuti snapshot aturan ketika mendaftar; perubahan pengaturan berikutnya tidak mengubah kewajiban pendaftar lama.
PIP/KIP selalu opsional. Tidak ada penghapusan otomatis data pendaftaran.

## Pendaftaran offline

1. Admin membuka Data siswa → Pendaftaran offline.
2. Isi biodata dan pilihan kegiatan. Centang berkas fisik yang sudah diterima.
3. Simpan meskipun berkas belum lengkap.
4. Buka detail siswa → Berkas. Penerimaan berkas tambahan dapat dicatat dengan checkbox berkas fisik, lalu simpan pemeriksaan.
5. Jika siswa ingin memakai portal, buka tab Akses dan ikuti proses aktivasi di bawah.

Admin juga dapat mengunggah salinan digital melalui tab Berkas. Berkas terverifikasi harus dibuka kembali sebelum diganti.

Berkas fisik tidak berarti file digital tersedia. Tombol unduh hanya ada jika file digital tersimpan.

## Pemeriksaan dan keputusan penerimaan

Cari nama, NISN, atau nomor pendaftaran. Filter Website/Offline dan status.
Data diurutkan dari yang terbaru, 25 data per halaman. Ekspor CSV hanya memuat halaman aktif.
Klik siswa untuk melihat:

- **Biodata:** identitas, sekolah asal, kontak wali, pilihan kegiatan dan sumber pendaftaran. Edit lalu simpan jika perlu.
- **Berkas:** unduh dokumen, beri status Menunggu pemeriksaan/Terverifikasi/Perlu perbaikan. Catatan wajib saat meminta perbaikan dan dapat dilihat pemilik berkas.
- **Status:** tentukan Verifikasi, Terverifikasi, Wawancara, Diterima atau Ditolak. Catatan internal tidak ditampilkan kepada pendaftar. Status Terverifikasi/Diterima mensyaratkan seluruh berkas wajib terverifikasi.
- **Akses:** buat tautan aktivasi/pemulihan setelah identitas pemohon diperiksa.

Verifikasi dokumen tidak otomatis menerima siswa. Keputusan tetap disimpan admin melalui tab Status.
Riwayat status, pemeriksaan dan versi dokumen disimpan dalam tabel terkait; tampilan detail menampilkan kondisi terakhir.

## Portal, perbaikan berkas dan pemulihan akun

Pendaftar online masuk `/pendaftar` menggunakan nomor dan password yang dibuat saat pendaftaran.
Di portal, lihat status, catatan pemeriksaan, unduh dokumen sendiri atau ganti file yang belum terverifikasi.
Berkas baru berstatus Menunggu pemeriksaan. Versi lama tetap disimpan; berkas terverifikasi terkunci.
Hubungi panitia jika perlu membuka kembali berkas terverifikasi.

Untuk offline/lupa password:

1. Panitia memeriksa identitas pemohon melalui prosedur sekolah.
2. Buka detail pendaftar → Akses → centang identitas telah diperiksa → Buat tautan akses.
3. Berikan tautan dan nomor pendaftaran secara pribadi, bukan di grup publik.
4. Pendaftar membuka tautan dan membuat password baru, lalu login.

Tautan berlaku 30 menit, sekali pakai. Membuat tautan baru membatalkan tautan sebelumnya.
Pemulihan password membatalkan sesi lama. Tidak ada pengiriman email/SMS otomatis.

## Penyimpanan dan backup lokal

Kode dibagikan lewat Git. Database, akun, berkas dan `.env` tidak ikut push/pull.
Setiap laptop memiliki database sendiri. Stop/start atau recreate container mempertahankan volume.
Repository ini menggunakan volume terpisah dari repository sekolah semula.

Backup PostgreSQL dari root project (buat folder `backups` dahulu):

```bash
docker compose --env-file backend/.env -f compose.dev.yaml exec postgres pg_dump -U nurul_huda -d nurul_huda -Fc -f /tmp/pkm-backup.dump
docker compose --env-file backend/.env -f compose.dev.yaml cp postgres:/tmp/pkm-backup.dump backups/database.dump
```

Untuk salinan yang konsisten dengan berkas, lakukan saat tidak ada pengguna mengirim/mengubah data.
Backup berkas privat juga diperlukan:

```bash
docker compose --env-file backend/.env -f compose.dev.yaml cp backend:/app/backend/uploads backups/uploads
```

Gunakan nama folder backup berbeda setiap kali. Lindungi backup seperti data asli; jangan commit ke Git.
Jangan menggunakan `down -v` atau `volume prune` pada volume kerja.

## Batas penggunaan

Konfigurasi Compose ini untuk development lokal. Sebelum dipasang di VPS, siapkan
HTTPS/domain, rahasia yang berbeda, backup terjadwal beserta uji restore, pengaturan akses server,
dan review data sekolah. Data seed tidak boleh dianggap sebagai informasi resmi.
Belum termasuk nilai, rapor, pembayaran, absensi atau pengiriman notifikasi otomatis.
