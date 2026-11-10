import { eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { admissionPeriods, schoolSettings } from "../../db/schema/settings.js";
import { settingsInput } from "./settings.schema.js";

export const initialSettings = {
  schoolName: "SMP Nurul Huda",
  tagline: "Berilmu, berakhlak, dan tumbuh bersama",
  email: "sekolah@example.test",
  ppdbEmail: "ppdb@example.test",
  phone: "081200000001",
  whatsapp: "081200000001",
  address: "Alamat sekolah belum diatur. Silakan perbarui melalui Pengaturan.",
  academicYear: "2026/2027",
  registrationOpen: false,
  registrationOpensAt: null,
  registrationClosesAt: null,
  documentRequirements: {
    requiredKinds: [],
    requireOneGraduationDocument: false,
  },
  dataRetention: "indefinite" as const,
};
export async function ensureSettings(db: Database) {
  await db.transaction(async (tx) => {
    await tx
      .insert(admissionPeriods)
      .values({ academicYear: initialSettings.academicYear })
      .onConflictDoNothing();
    await tx
      .insert(schoolSettings)
      .values(initialSettings)
      .onConflictDoNothing();
  });
}
export function createSettingsService(db: Database) {
  const serialize = (v: typeof schoolSettings.$inferSelect) => ({
    schoolName: v.schoolName,
    tagline: v.tagline,
    email: v.email,
    ppdbEmail: v.ppdbEmail,
    phone: v.phone,
    whatsapp: v.whatsapp,
    address: v.address,
    academicYear: v.academicYear,
    registrationOpen: v.registrationOpen,
    registrationOpensAt: v.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: v.registrationClosesAt?.toISOString() ?? null,
    documentRequirements: v.documentRequirements,
    dataRetention: "indefinite" as const,
  });
  return {
    async get() {
      let [row] = await db
        .select()
        .from(schoolSettings)
        .where(eq(schoolSettings.id, 1));
      if (!row) {
        await ensureSettings(db);
        [row] = await db
          .select()
          .from(schoolSettings)
          .where(eq(schoolSettings.id, 1));
      }
      return serialize(row!);
    },
    async save(input: unknown) {
      const v = settingsInput.parse(input);
      return db.transaction(async (tx) => {
        await tx
          .insert(admissionPeriods)
          .values({ academicYear: v.academicYear })
          .onConflictDoNothing();
        const data = {
          ...v,
          registrationOpensAt: v.registrationOpensAt
            ? new Date(v.registrationOpensAt)
            : null,
          registrationClosesAt: v.registrationClosesAt
            ? new Date(v.registrationClosesAt)
            : null,
        };
        const [row] = await tx
          .insert(schoolSettings)
          .values(data)
          .onConflictDoUpdate({
            target: schoolSettings.id,
            set: { ...data, updatedAt: new Date() },
          })
          .returning();
        return serialize(row!);
      });
    },
  };
}
