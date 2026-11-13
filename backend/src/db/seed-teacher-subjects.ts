import { and, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "./client.js";
import { schoolProfile } from "../config/school-profile.js";
import { auditEvents, schoolLeaders, teachers } from "./schema/index.js";

export async function seedTeacherSubjects(db: Database) {
  const version = "teacher-subjects-2026-11-13-v2";
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(820010)`);
    const [done] = await tx
      .select({ id: auditEvents.id })
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.action, "school.teachers.update"),
          eq(auditEvents.resourceId, version),
        ),
      )
      .limit(1);
    if (done) return false;
    for (const person of schoolProfile.teachers) {
      await tx
        .update(teachers)
        .set({ subject: person.subject })
        .where(
          and(
            eq(teachers.id, person.id),
            inArray(teachers.subject, ["Tenaga pendidik", "Guru Bidang Studi"]),
          ),
        );
    }
    for (const [teacherId, leaderId, oldTeacher, oldLeader] of [
      ["nh-hasan", "org-sarpras", "Bpk. Hasan, S.Kom", "Hasan, S.Kom"],
      [
        "nh-hajar-bayani-ammri",
        "org-perpustakaan",
        "Ibu Hajjar Bayani Ammi, S.Pd",
        "Hajjar Bayani Ammi, S.Pd",
      ],
    ] as const) {
      const teacher = schoolProfile.teachers.find((p) => p.id === teacherId)!;
      const leader = schoolProfile.leaders.find((p) => p.id === leaderId)!;
      await tx
        .update(teachers)
        .set({ name: teacher.name })
        .where(
          and(
            eq(teachers.id, teacherId),
            inArray(teachers.name, [oldTeacher, `${oldTeacher}.`]),
          ),
        );
      await tx
        .update(schoolLeaders)
        .set({ name: leader.name })
        .where(
          and(
            eq(schoolLeaders.id, leaderId),
            inArray(schoolLeaders.name, [oldLeader, `${oldLeader}.`]),
          ),
        );
    }
    await tx.insert(auditEvents).values({
      action: "school.teachers.update",
      resourceType: "school-profile",
      resourceId: version,
    });
    return true;
  });
}
