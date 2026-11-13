import { and, eq, sql } from "drizzle-orm";
import type { Database } from "./client.js";
import { schoolProfile } from "../config/school-profile.js";
import { schoolLeaders, teachers, auditEvents } from "./schema/index.js";

const version = "organization-chart-2026-11-13";
export async function seedSchoolOrganization(db: Database) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(820010)`);
    const [done] = await tx
      .select({ id: auditEvents.id })
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.action, "school.organization.initialize"),
          eq(auditEvents.resourceId, version),
        ),
      )
      .limit(1);
    if (done) return false;
    const [existing] = await tx
      .select({ id: schoolLeaders.id })
      .from(schoolLeaders)
      .limit(1);
    if (!existing)
      await tx
        .insert(schoolLeaders)
        .values(
          schoolProfile.leaders.map((person, sortOrder) => ({
            ...person,
            sortOrder,
          })),
        );
    for (const person of schoolProfile.teachers) {
      await tx
        .update(teachers)
        .set({ subject: "Guru Bidang Studi" })
        .where(
          and(
            eq(teachers.id, person.id),
            eq(teachers.subject, "Tenaga pendidik"),
          ),
        );
    }
    for (const [id, oldName] of [
      ["nh-hasan", "Bpk. Hasan, S.Pd"],
      ["nh-hajar-bayani-ammri", "Ibu Hajar Bayani Ammri, S.Pd"],
    ]) {
      const source = schoolProfile.teachers.find((person) => person.id === id);
      if (source)
        await tx
          .update(teachers)
          .set({ name: source.name })
          .where(and(eq(teachers.id, id!), eq(teachers.name, oldName!)));
    }
    await tx
      .insert(auditEvents)
      .values({
        action: "school.organization.initialize",
        resourceType: "school-profile",
        resourceId: version,
      });
    return !existing;
  });
}
