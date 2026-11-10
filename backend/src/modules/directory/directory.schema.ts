import { z } from "zod";
const common = {
  id: z.string().min(1).max(120),
  name: z.string().trim().min(2).max(120),
  initials: z.string().trim().min(1).max(3),
  tone: z
    .string()
    .max(30)
    .regex(/^[a-z-]*$/),
  portraitIndex: z.number().int().min(0).max(7),
};
export const directoryInput = z
  .strictObject({
    leaders: z
      .array(
        z.strictObject({
          ...common,
          role: z.string().trim().min(2).max(120),
          focus: z.string().trim().min(2).max(240),
          level: z.enum(["principal", "leadership", "support"]),
        }),
      )
      .max(100),
    teachers: z
      .array(
        z.strictObject({
          ...common,
          subject: z.string().trim().min(2).max(120),
          cluster: z.enum(["Sains", "Bahasa", "Sosial", "Kreatif & Karakter"]),
          years: z.number().int().min(0).max(60),
          note: z.string().trim().min(2).max(300),
        }),
      )
      .max(300),
  })
  .refine(
    (v) => v.leaders.filter((l) => l.level === "principal").length <= 1,
    "Maksimal satu kepala sekolah.",
  )
  .refine(
    (v) =>
      new Set(v.leaders.map((l) => l.id)).size === v.leaders.length &&
      new Set(v.teachers.map((t) => t.id)).size === v.teachers.length,
    "ID tidak boleh berulang.",
  );
