# Arsip prototype Blog — Anggota 04

Versi ini disimpan sebagai riwayat pekerjaan awal dan tidak dijalankan oleh Docker.
Blog aktif ada di `frontend/app/` dan `backend/src/modules/posts/`.
Untuk menjalankan sistem lengkap, ikuti [panduan utama](../../README.md).

Prototype mandiri untuk fitur Blog dan Artikel SMP Nurul Huda, mengikuti kontrak pada PDF tugas.

## Fitur
- Halaman blog publik menampilkan artikel berstatus **Terbit** saja.
- Pencarian artikel dan filter kategori.
- Halaman detail artikel berdasarkan slug; draft atau slug yang tidak tersedia tidak dapat dibuka dari halaman publik.
- Panel admin demo untuk tambah, edit, hapus, simpan draft, dan terbitkan artikel.
- Validasi judul, slug unik, kategori, path gambar, ringkasan, penulis, isi paragraf.
- Isi artikel dipisahkan menjadi `string[]` dan ditampilkan sebagai teks aman, bukan HTML.
- Responsif untuk desktop dan ponsel.
- Penyimpanan demo menggunakan `localStorage`, sehingga data tetap ada saat refresh pada browser yang sama.

## Cara menjalankan
Cara paling mudah: buka `index.html` di browser. Untuk menjalankan melalui server lokal:
```bash
python -m http.server 8000
```
Lalu buka `http://localhost:8000`.

## Catatan penting sebelum integrasi
Ini adalah **prototype frontend mandiri**, bukan implementasi backend production. Data disimpan di browser dan bukan database server; admin belum dilindungi autentikasi/role server. Form gambar menerima path aset saja, bukan upload file. Sebelum digabungkan ke repo utama, hubungkan `PostsModule`/halaman blog ke API yang ditetapkan pada PDF:
- `GET /api/v1/posts`
- `GET /api/v1/posts/by-slug/{slug}`
- `GET /api/v1/admin/posts`
- `POST /api/v1/posts`
- `PATCH /api/v1/posts/{postId}` (mengirim seluruh `PostInput`)
- `DELETE /api/v1/posts/{postId}`

Operasi tulis harus dibatasi untuk role `super_admin` atau `editor` di server. Endpoint publik hanya boleh mengembalikan artikel `Terbit`; draft harus tidak ditemukan pada detail publik (404). Slug harus unik di server. Gunakan path gambar yang sudah tersedia, bukan upload gambar umum.

## Kontrak data artikel
```ts
type PostInput = {
  title: string;       // 3–180 karakter
  slug: string;        // huruf kecil/angka/tanda hubung, unik
  category: string;    // maks. 60 karakter
  image: string;      // path gambar, maks. 500 karakter
  excerpt: string;    // 10–220 karakter
  content: string[];  // minimal 1 paragraf, tiap paragraf maks. 5000 karakter
  author: string;     // 2–120 karakter
  status: "Terbit" | "Draft";
};
```

Konten awal dalam prototype merupakan data ilustrasi untuk pengujian, bukan berita faktual yang sudah diverifikasi dari sekolah.
