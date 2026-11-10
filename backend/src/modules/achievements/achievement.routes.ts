import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import { achievements } from "../../db/schema/achievements.js";
import type { Access } from "../../shared/http/access.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

const input = z.strictObject({
  title: z.string().trim().min(1).max(120),
  award: z.string().trim().min(1).max(120),
  level: z.enum([
    "Sekolah",
    "Kecamatan",
    "Kabupaten",
    "Kota",
    "Provinsi",
    "Nasional",
  ]),
  year: z.string().regex(/^\d{4}$/),
  category: z.enum(["Akademik", "Olahraga", "Seni", "Literasi", "Keagamaan"]),
  description: z.string().trim().min(1).max(600),
  image: z
    .string()
    .max(500)
    .refine(
      (v) => /^\/images\/[a-zA-Z0-9_./-]+$/.test(v) || /^https:\/\//.test(v),
      "Gunakan path gambar lokal atau HTTPS.",
    ),
  published: z.boolean(),
});
export async function registerAchievementRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
) {
  const guard = access.guard(["super_admin", "editor"]);
  app.get("/achievements", () =>
    db
      .select()
      .from(achievements)
      .where(eq(achievements.published, true))
      .orderBy(desc(achievements.year)),
  );
  app.get("/admin/achievements", { onRequest: guard }, () =>
    db.select().from(achievements).orderBy(desc(achievements.updatedAt)),
  );
  app.post("/achievements", { onRequest: guard }, async (r, reply) => {
    const [row] = await db
      .insert(achievements)
      .values(input.parse(r.body))
      .returning();
    return reply.code(201).send(row);
  });
  app.patch<{ Params: { id: string } }>(
    "/achievements/:id",
    { onRequest: guard },
    async (r) => {
      const [row] = await db
        .update(achievements)
        .set(input.partial().parse(r.body))
        .where(eq(achievements.id, z.uuid().parse(r.params.id)))
        .returning();
      if (!row) throw new NotFoundError();
      return row;
    },
  );
  app.delete<{ Params: { id: string } }>(
    "/achievements/:id",
    { onRequest: guard },
    async (r, reply) => {
      const rows = await db
        .delete(achievements)
        .where(eq(achievements.id, z.uuid().parse(r.params.id)))
        .returning({ id: achievements.id });
      if (!rows.length) throw new NotFoundError();
      return reply.code(204).send();
    },
  );
}
