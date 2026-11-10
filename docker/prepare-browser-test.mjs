import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../backend/package.json", import.meta.url),
);
const postgres = require("postgres");
const { hash } = require("@node-rs/argon2");
const url = new URL(process.env.DATABASE_URL || "postgres://invalid");
assert.equal(process.env.RUN_BROWSER_TESTS, "1");
assert.ok(["postgres", "127.0.0.1", "localhost"].includes(url.hostname));
assert.match(url.pathname, /_(test|ci)$/);
const db = postgres(url.href);
try {
  const passwordHash = await hash("Browser-fixture-password-2026");
  await db`INSERT INTO admins(email,password_hash,display_name,role) VALUES ('browser-test@example.test',${passwordHash},'Admin Pengujian','super_admin') ON CONFLICT (email) DO UPDATE SET password_hash=excluded.password_hash, role=excluded.role`;
  console.log("Akun pengujian browser siap di database uji.");
} finally {
  await db.end();
}
