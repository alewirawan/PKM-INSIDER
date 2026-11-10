import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import type { AppConfig } from "../../config/env.js";
import {
  contactMessages,
  newsletterSubscriptions,
} from "../../db/schema/messages.js";
import { requireOrigin, type Access } from "../../shared/http/access.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

const messageInput = z.strictObject({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  topic: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000),
});
export async function registerMessageRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
  config: AppConfig,
) {
  const guard = access.guard(["super_admin", "editor"]);
  app.post(
    "/messages",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (r, reply) => {
      requireOrigin(r, config);
      const [row] = await db
        .insert(contactMessages)
        .values(messageInput.parse(r.body))
        .returning({ id: contactMessages.id });
      return reply.code(201).send(row);
    },
  );
  app.get("/messages", { onRequest: guard }, () =>
    db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.submittedAt))
      .limit(500),
  );
  app.patch<{ Params: { id: string } }>(
    "/messages/:id",
    { onRequest: guard },
    async (r) => {
      const [row] = await db
        .update(contactMessages)
        .set(
          z
            .strictObject({ status: z.enum(["Baru", "Dibaca", "Selesai"]) })
            .parse(r.body),
        )
        .where(eq(contactMessages.id, z.uuid().parse(r.params.id)))
        .returning();
      if (!row) throw new NotFoundError();
      return row;
    },
  );
  app.delete<{ Params: { id: string } }>(
    "/messages/:id",
    { onRequest: guard },
    async (r, reply) => {
      const rows = await db
        .delete(contactMessages)
        .where(eq(contactMessages.id, z.uuid().parse(r.params.id)))
        .returning({ id: contactMessages.id });
      if (!rows.length) throw new NotFoundError();
      return reply.code(204).send();
    },
  );
  app.post(
    "/newsletter-subscriptions",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (r, reply) => {
      requireOrigin(r, config);
      const value = z
        .strictObject({
          email: z
            .email()
            .max(254)
            .transform((v) => v.toLowerCase()),
          consent: z.literal(true),
        })
        .parse(r.body);
      await db.execute(sql`INSERT INTO ${newsletterSubscriptions} (email, consent_at) VALUES (${value.email}, now())
      ON CONFLICT (lower(btrim(email))) DO UPDATE SET consent_at = now(), unsubscribed_at = NULL, updated_at = now()`);
      return reply.code(204).send();
    },
  );
}
