import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../../config/env.js";
import { createAuthRepository } from "./auth.repository.js";
import { createAuthService } from "./auth.service.js";
import { requireOrigin } from "../../shared/http/access.js";

type LoginBody = { email: string; password: string };

const loginSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", maxLength: 254 },
      password: { type: "string", minLength: 8, maxLength: 128 },
    },
  },
} as const;

export async function registerAuthRoutes(
  app: FastifyInstance,
  config: AppConfig,
) {
  const repository = createAuthRepository(app.db);
  const service = createAuthService(repository, config.SESSION_TTL_HOURS);
  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/v1",
    maxAge: config.SESSION_TTL_HOURS * 60 * 60,
  };

  app.post<{ Body: LoginBody }>(
    "/auth/login",
    {
      schema: loginSchema,
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      requireOrigin(request, config);
      const userAgent = request.headers["user-agent"];
      const result = await service.login({
        email: request.body.email,
        password: request.body.password,
        ipAddress: request.ip,
        ...(userAgent ? { userAgent: userAgent.slice(0, 500) } : {}),
      });
      reply.setCookie(config.SESSION_COOKIE_NAME, result.token, cookieOptions);
      return reply.code(204).send();
    },
  );

  app.get("/auth/session", async (request) => {
    return service.getSession(request.cookies[config.SESSION_COOKIE_NAME]);
  });

  app.post("/auth/logout", async (request, reply) => {
    requireOrigin(request, config);
    await service.logout(request.cookies[config.SESSION_COOKIE_NAME]);
    reply.clearCookie(config.SESSION_COOKIE_NAME, {
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      httpOnly: true,
    });
    return reply.code(204).send();
  });
}
