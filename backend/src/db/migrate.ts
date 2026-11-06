import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { createDatabase } from "./client.js";

type Connection = ReturnType<typeof createDatabase>;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function migrateSchoolDatabase(connection: Connection, folder = resolve("drizzle")) {
  const { client, db } = connection;
  const [state] = await client`SELECT to_regclass('drizzle.__drizzle_migrations') AS journal`;
  if (state?.journal) {
    const legacy = await readFile(resolve(folder, "0001_posts.sql"), "utf8");
    const journal = JSON.parse(await readFile(resolve(folder, "meta/_journal.json"), "utf8")) as {
      entries: { tag: string; when: number }[];
    };
    const original = await Promise.all(journal.entries.slice(0, 3).map(async (entry) => {
      const sql = await readFile(resolve(folder, `${entry.tag}.sql`), "utf8");
      return { ...entry, sql, hash: hash(sql) };
    }));
    await client.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(671459031)`;
      const history = await tx<{ hash: string }[]>`SELECT hash FROM drizzle.__drizzle_migrations`;
      const known = new Set(history.map((row) => row.hash));
      if (!known.has(hash(legacy)) || known.has(original[2]!.hash)) return;
      if (history.length !== 2 || !known.has(original[0]!.hash))
        throw new Error("Riwayat migration tidak dikenali. Periksa database sebelum melanjutkan.");
      const [tables] = await tx`SELECT to_regclass('public.school_settings') AS settings,
        to_regclass('public.clubs') AS clubs, to_regclass('public.posts') AS posts,
        to_regnamespace('migration_recovery') AS backup`;
      if (tables?.settings || tables?.clubs || !tables?.posts || tables?.backup)
        throw new Error("Schema tidak sesuai jalur pemulihan Blog; migration dibatalkan.");
      await tx`CREATE SCHEMA migration_recovery`;
      await tx`ALTER TABLE public.posts SET SCHEMA migration_recovery`;
      await tx`ALTER TYPE public.post_status SET SCHEMA migration_recovery`;
      for (const entry of original.slice(1)) {
        for (const statement of entry.sql.split("--> statement-breakpoint")) {
          if (statement.trim()) await tx.unsafe(statement);
        }
        await tx`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${entry.hash}, ${entry.when})`;
      }
      await tx`INSERT INTO public.posts
        (id,title,slug,category,image,excerpt,content,author,status,published_at,created_at,updated_at)
        SELECT id,title,slug,category,image,excerpt,to_jsonb(content),author,
          status::text::public.post_status,published_at,created_at,updated_at
        FROM migration_recovery.posts`;
    });
  }
  await migrate(db, { migrationsFolder: folder });
}
