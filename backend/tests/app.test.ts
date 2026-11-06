import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config/env.js";

const config: AppConfig = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 4000,
  DATABASE_URL: "postgres://test:test@127.0.0.1:5432/test",
  FRONTEND_ORIGINS: ["http://localhost:3000"],
  SESSION_COOKIE_NAME: "test_session",
  SESSION_TTL_HOURS: 1,
  UPLOAD_DIR: "./uploads-test",
  MAX_UPLOAD_MB: 1,
  TRUST_PROXY: false,
};

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("backend foundation", () => {
  it.each(["PATCH", "DELETE"])("allows browser preflight for %s content requests", async (method) => {
    const app = await buildApp(config);
    apps.push(app);
    for (const path of ["posts", "clubs", "agenda"]) {
      const response = await app.inject({ method: "OPTIONS", url: `/api/v1/${path}/example`, headers: {
        origin: "http://localhost:3000", "access-control-request-method": method,
        "access-control-request-headers": "content-type",
      } });
      expect(response.statusCode).toBe(204);
      expect(response.headers["access-control-allow-methods"]).toContain(method);
      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    }
  });
  it("returns a health response without touching the database", async () => {
    const app = await buildApp(config);
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "nurul-huda-backend",
    });
  });

  it("uses the standard error envelope for unknown routes", async () => {
    const app = await buildApp(config);
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/missing" });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      code: "NOT_FOUND",
      message: "Endpoint tidak ditemukan.",
    });
  });

  it("rejects an incomplete login payload before querying PostgreSQL", async () => {
    const app = await buildApp(config);
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "invalid" },
    });
    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("requires an authenticated editor for the admin posts endpoint", async () => {
    const app = await buildApp(config);
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/admin/posts",
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("validates publishedAt and the required article fields", async () => {
    const app = await buildApp(config);
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/posts",
      payload: { title: "Artikel tanpa tanggal" },
    });
    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
