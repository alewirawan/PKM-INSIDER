import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import type { AppConfig } from "./config/env.js";
import { createDatabase } from "./db/client.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerHealthRoutes } from "./modules/health/health.routes.js";
import { registerPostRoutes } from "./modules/posts/post.routes.js";
import { createAuthRepository } from "./modules/auth/auth.repository.js";
import { createContentGuard } from "./modules/auth/auth.guard.js";
import { createClubRepository } from "./modules/clubs/club.repository.js";
import { registerClubRoutes } from "./modules/clubs/club.routes.js";
import { createAgendaRepository } from "./modules/agenda/agenda.repository.js";
import { registerAgendaRoutes } from "./modules/agenda/agenda.routes.js";
import { registerErrorHandlers } from "./shared/http/error-handler.js";
import { createAccess } from "./shared/http/access.js";
import { registerSettingsRoutes } from "./modules/settings/settings.routes.js";
import { registerDirectoryRoutes } from "./modules/directory/directory.routes.js";
import { registerAchievementRoutes } from "./modules/achievements/achievement.routes.js";
import { registerMessageRoutes } from "./modules/messages/message.routes.js";
import { registerApplicationRoutes } from "./modules/applications/application.routes.js";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: config.NODE_ENV === "test" ? false : { level: "info" },
    disableRequestLogging: true,
    trustProxy: config.TRUST_PROXY,
    bodyLimit: config.MAX_UPLOAD_MB * 1024 * 1024,
  });
  const { client, db } = createDatabase(config.DATABASE_URL);
  app.decorate("db", db);
  app.addHook("onClose", async () => client.end());

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(cors, {
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin(origin, callback) {
      if (!origin || config.FRONTEND_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin tidak diizinkan."), false);
    },
  });
  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: "1 minute",
  });
  await app.register(multipart, {
    limits: {
      files: 8,
      fields: 1,
      fieldSize: 16384,
      parts: 9,
      fileSize: Math.min(5, config.MAX_UPLOAD_MB) * 1024 * 1024,
    },
  });

  registerErrorHandlers(app);
  await app.register(
    async (api) => {
      api.addHook("onSend", async (_request, reply) => {
        reply.header("Cache-Control", "no-store");
      });
      const access = createAccess(db, config);
      await registerHealthRoutes(api);
      await registerAuthRoutes(api, config);
      const contentGuard = createContentGuard(createAuthRepository(db), config);
      await registerClubRoutes(api, createClubRepository(db), contentGuard);
      await registerAgendaRoutes(api, createAgendaRepository(db), contentGuard);
      await registerPostRoutes(api, config);
      await registerSettingsRoutes(api, db, access);
      await registerDirectoryRoutes(api, db, access);
      await registerAchievementRoutes(api, db, access);
      await registerMessageRoutes(api, db, access, config);
      await registerApplicationRoutes(api, db, access, config);
      await registerDashboardRoutes(api, db, access);
    },
    { prefix: "/api/v1" },
  );

  return app;
}
