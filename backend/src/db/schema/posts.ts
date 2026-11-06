import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { admins } from "./auth.js";
import { timestamps } from "./common.js";

export const postStatus = pgEnum("post_status", ["Terbit", "Draft"]);
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: text("slug").notNull().unique(),
    category: varchar("category", { length: 60 }).notNull(),
    image: varchar("image", { length: 500 }).notNull(),
    excerpt: varchar("excerpt", { length: 220 }).notNull(),
    content: jsonb("content").$type<string[]>().notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    createdBy: uuid("created_by").references(() => admins.id, {
      onDelete: "set null",
    }),
    status: postStatus("status").notNull().default("Draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    check("posts_slug_ck", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("posts_content_ck", sql`nh_valid_paragraphs(${table.content})`),
    check(
      "posts_text_ck",
      sql`length(btrim(${table.title})) >= 3 AND length(btrim(${table.excerpt})) >= 10 AND length(btrim(${table.author})) >= 2`,
    ),
    index("posts_status_updated_idx").on(
      table.status,
      table.updatedAt,
      table.id,
    ),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
