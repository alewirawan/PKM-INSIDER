import { z } from "zod";

export const postInput = z.strictObject({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  category: z.string().trim().min(1).max(60),
  image: z.string().regex(/^\/images\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/).max(500),
  excerpt: z.string().trim().min(10).max(220),
  content: z.array(z.string().trim().min(1).max(5000)).min(1),
  author: z.string().trim().min(2).max(120),
  status: z.enum(["Terbit", "Draft"]),
  publishedAt: z.iso.datetime({ offset: true }),
});
export type PostInput = z.infer<typeof postInput>;
