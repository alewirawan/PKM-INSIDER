import { mkdtemp, mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { describe, it, expect } from "vitest";
import { createDatabase } from "../src/db/client.js";
import { migrateSchoolDatabase } from "../src/db/migrate.js";

const url = process.env.BLOG_RECOVERY_DATABASE_URL;
describe.skipIf(!url)("recovery of the divergent posts migration", () => {
  it("retains articles and registration data, rolls back incompatible data, and is repeatable", async () => {
    const target = new URL(url!);
    if (target.hostname !== "127.0.0.1" || !/^\/nh_blog_recovery_test(?:_[a-z0-9]+)?$/.test(target.pathname))
      throw new Error("Gunakan database nh_blog_recovery_test lokal yang kosong.");
    const connection = createDatabase(url!);
    const { db, client } = connection;
    try {
      expect(await client`SELECT 1 FROM pg_tables WHERE schemaname='public'`).toHaveLength(0);
      const folder = fileURLToPath(new URL("../drizzle", import.meta.url));
      const journal = JSON.parse(await readFile(join(folder, "meta/_journal.json"), "utf8"));
      journal.entries = [journal.entries[0], { idx: 1, version: "7", when: 1793868360000, tag: "0001_posts", breakpoints: true }];
      const partial = await mkdtemp(join(tmpdir(), "nh-blog-migrations-"));
      await mkdir(join(partial, "meta"));
      await writeFile(join(partial, "meta/_journal.json"), JSON.stringify(journal));
      for (const entry of journal.entries)
        await copyFile(join(folder, `${entry.tag}.sql`), join(partial, `${entry.tag}.sql`));
      await migrate(db, { migrationsFolder: partial });
      const [article] = await client`INSERT INTO posts (title,slug,category,image,excerpt,content,author,status,published_at)
        VALUES ('Artikel lama','artikel-lama','Akademik','/images/science.jpg','Ringkasan artikel lama.',ARRAY['Isi pertama.','Isi kedua.'],'Editor Lama','Terbit','2026-11-05') RETURNING id`;
      const [application] = await client`INSERT INTO applications (registration_number,student_name,origin_school,program)
        VALUES ('NH-RECOVERY-001','Siswa Contoh','SD Contoh','STEM') RETURNING id`;
      await client`INSERT INTO application_documents (application_id,document_type,original_name,storage_key,mime_type,file_size)
        VALUES (${application!.id},'unknown','berkas.pdf','recovery-file','application/pdf',100)`;
      await expect(migrateSchoolDatabase(connection, folder)).rejects.toThrow();
      const [rollback] = await client`SELECT to_regnamespace('migration_recovery') AS backup, to_regclass('public.posts') AS posts`;
      expect(rollback).toMatchObject({ backup: null, posts: "posts" });
      expect(await client`SELECT id FROM posts`).toHaveLength(1);
      await client`UPDATE application_documents SET document_type='kk' WHERE storage_key='recovery-file'`;
      await migrateSchoolDatabase(connection, folder);
      expect(await client`SELECT tablename FROM pg_tables WHERE schemaname='public'`).toHaveLength(23);
      const [retained] = await client`SELECT id,content,status FROM public.posts`;
      expect(retained).toMatchObject({ id: article!.id, content: ["Isi pertama.", "Isi kedua."], status: "Terbit" });
      expect(await client`SELECT id FROM migration_recovery.posts`).toHaveLength(1);
      expect((await client`SELECT id FROM applications`)[0]!.id).toBe(application!.id);
      expect((await client`SELECT storage_key FROM application_documents`)[0]!.storage_key).toBe("recovery-file");
      await migrateSchoolDatabase(connection, folder);
      expect(await client`SELECT id FROM public.posts`).toHaveLength(1);
    } finally {
      await client.end();
    }
  });
});
