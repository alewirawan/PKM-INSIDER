import { schoolProfile as school } from "../../config/school-profile.js";
import { eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { admissionPeriods, schoolSettings } from "../../db/schema/settings.js";
import { settingsInput } from "./settings.schema.js";

const schoolDefaults = settingsInput.parse({
  schoolName: school.schoolName,
  tagline: school.tagline,
  email: school.email,
  ppdbEmail: school.email,
  phone: "",
  whatsapp: "",
  address: school.address,
  academicYear: "2026/2027",
  registrationOpen: true,
  registrationOpensAt: null,
  registrationClosesAt: null,
  documentRequirements: {
    requiredKinds: ["skl", "rapor", "akta", "kk", "ktp"],
    requireOneGraduationDocument: false,
  },
  dataRetention: "indefinite" as const,
});
export const initialSettings = {
  ...schoolDefaults,
  registrationOpensAt: null,
  registrationClosesAt: null,
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
