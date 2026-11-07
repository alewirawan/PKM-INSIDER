import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(new URL("../backend/package.json", import.meta.url));
const postgres = require("postgres");
const { hash } = require("@node-rs/argon2");
const url = new URL(process.env.DATABASE_URL || "postgres://invalid");
assert.equal(process.env.RUN_DOCKER_SMOKE, "1");
assert.equal(url.hostname, "postgres");
assert.equal(url.pathname, "/nurul_huda_ci");
const db = postgres(url.href);
const api = "http://backend:4000/api/v1";
const site = "http://frontend:3000";
const slug = "artikel-uji-docker";
try {
  const [{ count }] = await db`SELECT count(*)::int AS count FROM pg_tables WHERE schemaname='public'`;
  assert.equal(count, 23);
  assert.equal((await fetch(`${api}/ready`)).status, 200);
  assert.equal((await fetch(`${api}/admin/posts`)).status, 401);
  if (!process.argv.includes("--verify")) {
    const password = randomBytes(24).toString("hex");
    const passwordHash = await hash(password);
    await db`INSERT INTO admins (email,password_hash,display_name,role) VALUES ('docker-ci@example.test',${passwordHash},'Admin Uji Docker','editor')`;
    const login = await fetch(`${api}/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000" }, body: JSON.stringify({ email: "docker-ci@example.test", password }) });
    assert.equal(login.status, 204);
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie);
    const headers = { "content-type": "application/json", origin: "http://localhost:3000", cookie };
    const article = { title: "Artikel Pengujian Docker", slug, category: "Kegiatan", image: "/images/science.jpg", excerpt: "Artikel untuk menguji sambungan frontend dan backend.", content: ["Isi pengujian melalui PostgreSQL."], author: "Editor Pengujian", status: "Terbit", publishedAt: "2026-11-07T00:00:00.000Z" };
    assert.equal((await fetch(`${api}/posts`, { method: "POST", headers, body: JSON.stringify(article) })).status, 201);
    const options = await fetch(`${api}/posts`, { method: "OPTIONS", headers: { origin: "http://localhost:3000", "access-control-request-method": "POST", "access-control-request-headers": "content-type" } });
    assert.equal(options.headers.get("access-control-allow-origin"), "http://localhost:3000");
    assert.equal((await fetch(`${api}/auth/logout`, { method: "POST", headers: { origin: "http://localhost:3000", cookie } })).status, 204);
    assert.equal((await fetch(`${api}/auth/session`, { headers: { cookie } })).status, 401);
  }
  const detail = await fetch(`${site}/blog/${slug}`);
  assert.equal(detail.status, 200);
  assert.match(await detail.text(), /Artikel Pengujian Docker/);
  assert.match(await (await fetch(`${site}/sitemap.xml`)).text(), /artikel-uji-docker/);
  for (const path of ["/", "/admin", "/program", "/blog"])
    assert.equal((await fetch(site + path)).status, 200);
  for (const path of ["/clubs", "/agenda", "/posts"])
    assert.equal((await fetch(api + path)).status, 200);
  console.log("Docker: 23 tabel, login/logout, artikel, SSR, sitemap, dan API berhasil diperiksa.");
} finally {
  await db.end();
}
