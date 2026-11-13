import { createDatabase } from "../db/client.js";
import { seedSchoolProfile } from "../db/seed-school.js";
import { seedSchoolOrganization } from "../db/seed-organization.js";
import { seedTeacherSubjects } from "../db/seed-teacher-subjects.js";

async function main() {
  const url = process.env.DATABASE_URL;
  if (
    process.env.NODE_ENV === "production" ||
    !url ||
    !["localhost", "127.0.0.1", "[::1]", "postgres"].includes(
      new URL(url).hostname,
    )
  ) {
    throw new Error(
      "Inisialisasi konten ini hanya untuk database development lokal.",
    );
  }
  const { db, client } = createDatabase(url);
  try {
    const initialized = await seedSchoolProfile(db);
    const organizationInitialized = await seedSchoolOrganization(db);
    await seedTeacherSubjects(db);
    if (organizationInitialized)
      console.log("Struktur organisasi sesuai bagan sekolah ditambahkan.");
    console.log(
      initialized
        ? "Profil, guru, ekstrakurikuler, dan artikel sekolah ditambahkan."
        : "Konten sekolah sudah diinisialisasi; perubahan admin dipertahankan.",
    );
  } finally {
    await client.end();
  }
}
main().catch(() => {
  console.error(
    "Inisialisasi konten gagal. Pastikan migration selesai dan database lokal dapat diakses.",
  );
  process.exitCode = 1;
});
