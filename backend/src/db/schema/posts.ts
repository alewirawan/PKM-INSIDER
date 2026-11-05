import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", ["Terbit", "Draft"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    image: varchar("image", { length: 500 }).notNull(),
    excerpt: varchar("excerpt", { length: 220 }).notNull(),
    content: text("content").array().notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    status: postStatus("status").notNull().default("Draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("posts_slug_uq").on(table.slug),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
    index("posts_updated_at_idx").on(table.updatedAt),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
