import { createHash } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { AppConfig } from "../../config/env.js";
import type { Database } from "../../db/client.js";
import { createAuthRepository } from "../../modules/auth/auth.repository.js";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.js";

export type AdminRole = "super_admin" | "admin_ppdb" | "editor";
export function requireOrigin(request: FastifyRequest, config: AppConfig) {
  if (
    !request.headers.origin ||
    !config.FRONTEND_ORIGINS.includes(request.headers.origin)
  )
    throw new ForbiddenError("Origin permintaan tidak diizinkan.");
}
export function createAccess(db: Database, config: AppConfig) {
  const repository = createAuthRepository(db);
  async function admin(request: FastifyRequest, roles: AdminRole[]) {
    const token = request.cookies[config.SESSION_COOKIE_NAME];
    if (!token) throw new UnauthorizedError();
    const session = await repository.findValidSession(
      createHash("sha256").update(token).digest("hex"),
    );
    if (!session) throw new UnauthorizedError();
    if (!roles.includes(session.role)) throw new ForbiddenError();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method))
      requireOrigin(request, config);
    return session;
  }
  return {
    admin,
    guard: (roles: AdminRole[]) => async (request: FastifyRequest) => {
      await admin(request, roles);
    },
  };
}
export type Access = ReturnType<typeof createAccess>;
