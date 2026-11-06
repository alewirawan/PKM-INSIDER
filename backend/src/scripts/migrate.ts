import { createDatabase } from "../db/client.js";
import { migrateSchoolDatabase } from "../db/migrate.js";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL wajib diisi.");
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    await migrateSchoolDatabase(connection);
    console.log("Migration selesai. Jalankan db:verify untuk memeriksa struktur.");
  } finally {
    await connection.client.end();
  }
}

main().catch(() => {
  console.error("Migration gagal dan transaksi yang gagal dibatalkan. Periksa konfigurasi, riwayat migration, dan kompatibilitas data. Jangan hapus database atau migration lama.");
  process.exitCode = 1;
});
