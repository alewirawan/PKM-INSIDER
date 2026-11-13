import { and, eq, sql } from "drizzle-orm";
import type { Database } from "./client.js";
import { schoolProfile } from "../config/school-profile.js";
import { initialSettings } from "../modules/settings/settings.service.js";
import {
  admissionPeriods,
  schoolSettings,
  teachers,
  clubs,
  posts,
  auditEvents,
} from "./schema/index.js";

const contentVersion = "school-profile-2026-11-13";

export async function seedSchoolProfile(db: Database) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(820013)`);
    const [done] = await tx
      .select({ id: auditEvents.id })
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.action, "school.content.initialize"),
          eq(auditEvents.resourceId, contentVersion),
        ),
      )
      .limit(1);
    if (done) return false;

    await tx
      .insert(admissionPeriods)
      .values({ academicYear: initialSettings.academicYear })
      .onConflictDoNothing();
    const [existing] = await tx
      .select()
      .from(schoolSettings)
      .where(eq(schoolSettings.id, 1));
    if (!existing) {
      await tx.insert(schoolSettings).values(initialSettings);
    } else if (
      existing.address.startsWith("Alamat sekolah belum diatur.") &&
      existing.email === "sekolah@example.test"
    ) {
      await tx
        .update(schoolSettings)
        .set({ ...initialSettings, updatedAt: new Date() })
        .where(eq(schoolSettings.id, 1));
    }

    const tones = [
      "sage",
      "clay",
      "sky",
      "sand",
      "moss",
      "rose",
      "ocean",
      "sun",
    ];
    await tx
      .insert(teachers)
      .values(
        schoolProfile.teachers.map((person, sortOrder) => ({
          ...person,
          sortOrder,
          subject: person.subject,
          cluster: null,
          years: null,
          note: "SMP Nurul Huda Cisoka",
          tone: tones[sortOrder % tones.length]!,
          portraitIndex: 0,
        })),
      )
      .onConflictDoNothing();
    await tx
      .insert(clubs)
      .values(schoolProfile.clubs.map((club) => ({ ...club, active: true })))
      .onConflictDoNothing();
    await tx
      .insert(posts)
      .values({
        ...schoolProfile.event,
        status: "Terbit",
        publishedAt: new Date(schoolProfile.event.publishedAt),
      })
      .onConflictDoNothing();

    await tx.execute(sql`INSERT INTO application_document_slots (application_id, kind)
      SELECT a.id, k.kind::document_kind FROM applications a
      CROSS JOIN (VALUES ('rapor'), ('pasfoto')) AS k(kind)
      ON CONFLICT (application_id, kind) DO NOTHING`);
    await tx.insert(auditEvents).values({
      action: "school.content.initialize",
      resourceType: "school-profile",
      resourceId: contentVersion,
    });
    return true;
  });
}
