import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AppConfig } from "../../config/env.js";
import { createAuthRepository } from "../auth/auth.repository.js";
import { createAuthService } from "../auth/auth.service.js";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/app-error.js";
import { createPostRepository } from "./post.repository.js";
import { createPostService, type PostInput } from "./post.service.js";

const slugPattern = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
const inputSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["title", "slug", "category", "image", "excerpt", "content", "author", "status", "publishedAt"],
    properties: {
      title: { type: "string", minLength: 3, maxLength: 180 },
      slug: { type: "string", pattern: slugPattern, maxLength: 180 },
      category: { type: "string", minLength: 1, maxLength: 60 },
      image: { type: "string", minLength: 1, maxLength: 500 },
      excerpt: { type: "string", minLength: 10, maxLength: 220 },
      content: { type: "array", minItems: 1, items: { type: "string", minLength: 1, maxLength: 5000 } },
      author: { type: "string", minLength: 2, maxLength: 120 },
      status: { type: "string", enum: ["Terbit", "Draft"] },
      publishedAt: { type: "string", format: "date-time" },
    },
  },
} as const;

export async function registerPostRoutes(app: FastifyInstance, config: AppConfig) {
  const repository = createPostRepository(app.db);
  const service = createPostService(repository);
  const auth = createAuthService(createAuthRepository(app.db), config.SESSION_TTL_HOURS);

  async function requireEditor(request: FastifyRequest) {
    const token = request.cookies[config.SESSION_COOKIE_NAME];
    if (!token) throw new UnauthorizedError();
    const session = await auth.getSession(token);
    if (session.user.role !== "super_admin" && session.user.role !== "editor") {
      throw new ForbiddenError("Role Anda tidak memiliki akses untuk mengelola artikel.");
    }
    const origin = request.headers.origin;
    if (origin && !config.FRONTEND_ORIGINS.includes(origin)) {
      throw new ForbiddenError("Origin tidak diizinkan untuk operasi ini.");
    }
  }

  app.get("/posts", async () => service.listPublished());
  app.get<{ Params: { slug: string } }>("/posts/by-slug/:slug", {
    schema: { params: { type: "object", required: ["slug"], properties: { slug: { type: "string", pattern: slugPattern, maxLength: 180 } } } },
  }, async (request) => service.getPublishedBySlug(request.params.slug));
  app.get("/admin/posts", { preHandler: requireEditor }, async () => service.listAdmin());
  app.post<{ Body: PostInput }>("/posts", { schema: inputSchema, preHandler: requireEditor }, async (request, reply) => reply.code(201).send(await service.create(request.body)));
  app.patch<{ Params: { postId: string }; Body: PostInput }>("/posts/:postId", { schema: { ...inputSchema, params: { type: "object", required: ["postId"], properties: { postId: { type: "string", format: "uuid" } } } }, preHandler: requireEditor }, async (request) => service.update(request.params.postId, request.body));
  app.delete<{ Params: { postId: string } }>("/posts/:postId", { schema: { params: { type: "object", required: ["postId"], properties: { postId: { type: "string", format: "uuid" } } } }, preHandler: requireEditor }, async (request, reply) => {
    await service.delete(request.params.postId);
    return reply.code(204).send();
  });
}
