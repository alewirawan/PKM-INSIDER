import { z } from "zod";

export const requirementsInput = z.strictObject({
  requiredKinds: z
    .array(z.enum(["skl", "ijazah", "kk", "ktp", "akta", "rapor", "pasfoto"]))
    .max(7)
    .refine(
      (a) => new Set(a).size === a.length,
      "Jenis berkas tidak boleh berulang.",
    ),
  requireOneGraduationDocument: z.boolean(),
});
export const settingsInput = z
  .strictObject({
    schoolName: z.string().trim().min(2).max(120),
    tagline: z.string().trim().min(2).max(160),
    email: z.email().max(254),
    ppdbEmail: z.email().max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) => v.length === 0 || v.length >= 8,
        "Kosongkan atau isi nomor minimal 8 karakter.",
      ),
    whatsapp: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) => v.length === 0 || v.length >= 8,
        "Kosongkan atau isi nomor minimal 8 karakter.",
      ),
    address: z.string().trim().min(10).max(500),
    academicYear: z
      .string()
      .regex(/^\d{4}\/\d{4}$/)
      .refine(
        (v) => +v.slice(5) === +v.slice(0, 4) + 1,
        "Tahun ajaran harus berurutan.",
      ),
    registrationOpen: z.boolean(),
    registrationOpensAt: z.iso.datetime().nullable(),
    registrationClosesAt: z.iso.datetime().nullable(),
    documentRequirements: requirementsInput,
    dataRetention: z.literal("indefinite"),
  })
  .refine(
    (v) =>
      !v.registrationOpensAt ||
      !v.registrationClosesAt ||
      v.registrationClosesAt > v.registrationOpensAt,
    "Tanggal tutup harus setelah tanggal buka.",
  );
