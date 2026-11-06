import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { createDatabase } from "../src/db/client.js";
import { admins, adminSessions } from "../src/db/schema/auth.js";
import { testConfig } from "./content-fixture.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)("content PostgreSQL integration", () => {
  let app: FastifyInstance;
  let database: ReturnType<typeof createDatabase>;
  const token = randomUUID();
  const headers = {
    origin: testConfig.FRONTEND_ORIGINS[0]!,
    cookie: `test_session=${token}`,
  };
  beforeAll(async () => {
    const target = new URL(databaseUrl!);
    if (
      target.hostname !== "127.0.0.1" ||
      !/^\/team2_test(?:_[a-z0-9]+)?$/.test(target.pathname)
    )
      throw new Error("Gunakan database team2_test terpisah di 127.0.0.1.");
    database = createDatabase(databaseUrl!);
    await migrate(database.db, {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
    });
    const [admin] = await database.db
      .insert(admins)
      .values({
        email: `content-${Date.now()}@example.test`,
        passwordHash: "not-used-for-password-login",
        displayName: "Admin Pengujian",
        role: "editor",
      })
      .returning();
    await database.db.insert(adminSessions).values({
      adminId: admin!.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60_000),
    });
    app = await buildApp({ ...testConfig, DATABASE_URL: databaseUrl! });
  });
  afterAll(async () => {
    await app?.close();
    await database?.client.end();
  });
  it("keeps posts, clubs and agenda available together and persists article edits", async () => {
    const payload = {
      title: "Artikel pengujian", slug: `artikel-uji-${Date.now()}`, category: "Akademik",
      image: "/images/science.jpg", excerpt: "Ringkasan artikel untuk pengujian integrasi.",
      content: ["Paragraf pertama.", "Paragraf kedua."], author: "Editor Uji",
      status: "Draft", publishedAt: "2026-11-06T05:00:00.000Z",
    };
    const create = () => app.inject({ method: "POST", url: "/api/v1/posts", headers, payload });
    const created = await create();
    expect(created.statusCode).toBe(201);
    const record = created.json();
    expect(record.content).toEqual(payload.content);
    expect((await create()).statusCode).toBe(409);
    expect((await app.inject(`/api/v1/posts/by-slug/${payload.slug}`)).statusCode).toBe(404);
    expect((await app.inject({ url: "/api/v1/admin/posts", headers })).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: record.id })]),
    );
    for (const invalid of [{ title: "   " }, { content: ["   "] }, { image: "https://untrusted.example/x.jpg" }]) {
      expect((await app.inject({ method: "POST", url: "/api/v1/posts", headers, payload: { ...payload, ...invalid } })).statusCode).toBe(422);
    }
    expect((await app.inject({ method: "PATCH", url: `/api/v1/posts/${record.id}`, headers: { cookie: headers.cookie }, payload })).statusCode).toBe(403);
    const published = await app.inject({ method: "PATCH", url: `/api/v1/posts/${record.id}`, headers, payload: { ...payload, status: "Terbit" } });
    expect(published.statusCode).toBe(200);
    await app.close();
    app = await buildApp({ ...testConfig, DATABASE_URL: databaseUrl! });
    expect((await app.inject(`/api/v1/posts/by-slug/${payload.slug}`)).json()).toMatchObject({ id: record.id, content: payload.content, publishedAt: payload.publishedAt });
    expect((await app.inject("/api/v1/clubs")).statusCode).toBe(200);
    expect((await app.inject("/api/v1/agenda")).statusCode).toBe(200);
    expect((await app.inject({ method: "DELETE", url: `/api/v1/posts/${record.id}`, headers })).statusCode).toBe(204);
    expect((await app.inject(`/api/v1/posts/by-slug/${payload.slug}`)).statusCode).toBe(404);
  });
  it("persists across app restart, enforces uniqueness atomically, and filters private records in SQL", async () => {
    const name = `Pramuka ${Date.now()}`;
    const payload = { name, description: "Data pengujian", active: true };
    const results = await Promise.all(
      [payload, { ...payload, name: ` ${name.toUpperCase()} ` }].map((body) =>
        app.inject({
          method: "POST",
          url: "/api/v1/clubs",
          headers,
          payload: body,
        }),
      ),
    );
    expect(results.map((r) => r.statusCode).sort()).toEqual([201, 409]);
    const club = results.find((r) => r.statusCode === 201)!.json();
    await app.close();
    app = await buildApp({ ...testConfig, DATABASE_URL: databaseUrl! });
    expect((await app.inject("/api/v1/clubs")).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: club.id })]),
    );
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/api/v1/clubs/${club.id}`,
          headers,
          payload: { active: false },
        })
      ).statusCode,
    ).toBe(200);
    expect((await app.inject("/api/v1/clubs")).json()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: club.id })]),
    );
    expect(
      (await app.inject({ url: "/api/v1/admin/clubs", headers })).json(),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: club.id, active: false }),
      ]),
    );
    const agenda = {
      title: "Rapat internal uji",
      date: "2026-11-02",
      time: "09:00",
      location: "Ruang uji",
      type: "Rapat",
      completed: false,
      visibility: "Internal",
    };
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/agenda",
      headers,
      payload: agenda,
    });
    expect(response.statusCode).toBe(201);
    const record = response.json();
    expect((await app.inject("/api/v1/agenda")).json()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: record.id })]),
    );
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/api/v1/agenda/${record.id}`,
          headers,
          payload: { ...agenda, visibility: "Publik" },
        })
      ).statusCode,
    ).toBe(200);
    expect((await app.inject("/api/v1/agenda")).json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: record.id,
          date: agenda.date,
          time: agenda.time,
        }),
      ]),
    );
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/api/v1/agenda/${record.id}`,
          headers,
        })
      ).statusCode,
    ).toBe(204);
    expect((await app.inject("/api/v1/agenda")).json()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: record.id })]),
    );
  });
});
