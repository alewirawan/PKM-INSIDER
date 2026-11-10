# Kompatibilitas renderer artikel

Saat pembaruan dependency lokal, rentang Vinext prerelease mengizinkan pemasangan
1.4.4. Tes HTTP mendeteksi perubahan respons artikel tidak ditemukan dari 404
menjadi 200 karena fallback loading global memulai respons streaming lebih dulu.
Tidak ada deployment production atau dampak pada repository tim.

Percobaan mengembalikan versi beta dengan dependency baru menimbulkan ketidakcocokan
manifest build, sehingga tidak dipertahankan. Hasil akhir memakai Vinext 1.4.4 yang
dipin, menghapus boundary loading global, dan meneruskan notFound pada metadata
artikel. Indikator loading per fitur tetap tersedia.

Validasi: lint, TypeScript, build frontend, tes HTML termasuk HTTP 404 artikel,
tes client dan unit backend berhasil. Tes browser mencakup navigasi, PPDB dan
portal; pengujian Docker dilakukan pada pipeline repository.
Guardrail upgrade ada di docs/PEMERIKSAAN-TEKNIS.md: uji 404/SSR/routing bersama
seluruh dependency renderer dan jangan memaksa downgrade transitive secara acak.

## Runtime Docker

CI mengungkap dua kebutuhan runtime setelah upgrade: flag dev memakai --host,
dan image node slim perlu paket ca-certificates untuk Workerd. Keduanya diperbaiki
di Compose dan Dockerfile; sertifikat TLS tetap diverifikasi, tidak dinonaktifkan.
Validasi berikutnya harus mencakup startup Linux bersih, bukan hanya build di macOS.
