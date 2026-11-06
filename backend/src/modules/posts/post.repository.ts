import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { posts, type NewPost } from "../../db/schema/posts.js";

export function createPostRepository(db: Database) {
  return {
    listPublished() {
      return db.select().from(posts).where(eq(posts.status, "Terbit")).orderBy(desc(posts.publishedAt));
    },
    listAdmin() {
      return db.select().from(posts).orderBy(desc(posts.updatedAt));
    },
    findPublishedBySlug(slug: string) {
      return db.query.posts.findFirst({ where: and(eq(posts.slug, slug), eq(posts.status, "Terbit")) });
    },
    findById(id: string) {
      return db.query.posts.findFirst({ where: eq(posts.id, id) });
    },
    async create(input: Omit<NewPost, "id" | "createdAt" | "updatedAt">) {
      const [post] = await db.insert(posts).values(input).returning();
      if (!post) throw new Error("Artikel gagal disimpan.");
      return post;
    },
    async update(id: string, input: Omit<NewPost, "id" | "createdAt" | "updatedAt">) {
      const [post] = await db.update(posts).set({ ...input, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
      return post;
    },
    async delete(id: string) {
      await db.delete(posts).where(eq(posts.id, id));
    },
  };
}

export type PostRepository = ReturnType<typeof createPostRepository>;
