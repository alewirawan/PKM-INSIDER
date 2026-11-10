import { asc, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import { teachers, schoolLeaders } from "../../db/schema/directory.js";
import type { Access } from "../../shared/http/access.js";
import { directoryInput } from "./directory.schema.js";

export async function registerDirectoryRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
) {
  async function get() {
    const [leaders, staff] = await Promise.all([
      db
        .select()
        .from(schoolLeaders)
        .orderBy(asc(schoolLeaders.sortOrder), asc(schoolLeaders.id)),
      db
        .select()
        .from(teachers)
        .orderBy(asc(teachers.sortOrder), asc(teachers.id)),
    ]);
    return {
      leaders: leaders.map((v) => ({
        id: v.id,
        name: v.name,
        role: v.role,
        initials: v.initials,
        focus: v.focus,
        tone: v.tone,
        level: v.level,
        portraitIndex: v.portraitIndex,
      })),
      teachers: staff.map((v) => ({
        id: v.id,
        name: v.name,
        initials: v.initials,
        subject: v.subject,
        cluster: v.cluster,
        years: v.years,
        note: v.note,
        tone: v.tone,
        portraitIndex: v.portraitIndex,
      })),
    };
  }
  app.get("/directory", get);
  app.put(
    "/directory",
    { onRequest: access.guard(["super_admin", "editor"]) },
    async (r) => {
      const input = directoryInput.parse(r.body);
      await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(820010)`);
        await tx.delete(schoolLeaders);
        await tx.delete(teachers);
        if (input.teachers.length)
          await tx
            .insert(teachers)
            .values(
              input.teachers.map((v, sortOrder) => ({ ...v, sortOrder })),
            );
        if (input.leaders.length)
          await tx
            .insert(schoolLeaders)
            .values(input.leaders.map((v, sortOrder) => ({ ...v, sortOrder })));
      });
      return get();
    },
  );
}
