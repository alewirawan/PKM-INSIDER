import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import type { Access } from "../../shared/http/access.js";
import { createSettingsService } from "./settings.service.js";
export async function registerSettingsRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
) {
  const service = createSettingsService(db);
  app.get("/settings", () => service.get());
  app.put("/settings", { onRequest: access.guard(["super_admin"]) }, (r) =>
    service.save(r.body),
  );
}
