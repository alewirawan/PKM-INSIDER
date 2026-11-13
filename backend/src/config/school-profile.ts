import { readFileSync } from "node:fs";
import { z } from "zod";

const profileSchema = z.object({
  schoolName: z.string(),
  tagline: z.string(),
  email: z.email(),
  address: z.string(),
  leaders: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      initials: z.string(),
      parentId: z.string().nullable(),
      coordination: z.boolean(),
      level: z.enum(["principal", "leadership", "support"]),
      focus: z.string(),
      tone: z.string(),
      portraitIndex: z.number(),
    }),
  ),
  teachers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      initials: z.string(),
      subject: z.string(),
    }),
  ),
  clubs: z.array(
    z.object({ id: z.string(), name: z.string(), description: z.string() }),
  ),
  event: z.object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    publishedAt: z.iso.datetime(),
    image: z.string(),
    excerpt: z.string(),
    author: z.string(),
    content: z.array(z.string()),
  }),
});

export const schoolProfile = profileSchema.parse(
  JSON.parse(
    readFileSync(
      new URL("../../../contracts/school-profile.json", import.meta.url),
      "utf8",
    ),
  ),
);
