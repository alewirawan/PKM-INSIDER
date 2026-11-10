import { z } from "zod";
export const uploadKinds = [
  "skl",
  "ijazah",
  "kk",
  "ktp",
  "kip",
  "akta",
] as const;
export const documentKindInput = z.enum(uploadKinds);
export const applicationStatuses = [
  "Verifikasi",
  "Terverifikasi",
  "Wawancara",
  "Diterima",
  "Ditolak",
] as const;
export const statusToDb = {
  Verifikasi: "verification",
  Terverifikasi: "verified",
  Wawancara: "interview",
  Diterima: "accepted",
  Ditolak: "rejected",
} as const;
export const statusToUi = {
  verification: "Verifikasi",
  verified: "Terverifikasi",
  interview: "Wawancara",
  accepted: "Diterima",
  rejected: "Ditolak",
} as const;
export const applicationInput = z.strictObject({
  studentName: z.string().trim().min(2).max(120),
  nisn: z.string().regex(/^\d{10}$/),
  originSchool: z.string().trim().min(2).max(160),
  birthPlace: z.string().trim().min(2).max(100),
  birthDate: z.iso
    .date()
    .refine(
      (v) => v <= new Date().toISOString().slice(0, 10),
      "Tanggal lahir tidak boleh di masa depan.",
    ),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  address: z.string().trim().min(1).max(600),
  parentName: z.string().trim().min(2).max(120),
  parentOccupation: z.string().trim().max(120).default(""),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9 ]{8,20}$/),
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  extracurriculars: z
    .array(z.string().trim().min(1).max(80))
    .max(30)
    .default([])
    .refine(
      (v) => new Set(v.map((n) => n.toLowerCase())).size === v.length,
      "Pilihan kegiatan berulang.",
    ),
});
export const onlineInput = applicationInput.extend({
  password: z.string().min(12).max(128),
  consent: z.literal(true),
});
export const offlineInput = applicationInput.extend({
  notes: z.string().max(1000).default(""),
  receivedDocumentKinds: z
    .array(documentKindInput)
    .max(6)
    .default([])
    .refine((a) => new Set(a).size === a.length),
});
export const applicationUpdate = applicationInput.partial().extend({
  parentOccupation: z.string().trim().max(120).optional(),
  extracurriculars: z
    .array(z.string().trim().min(1).max(80))
    .max(30)
    .refine((v) => new Set(v.map((n) => n.toLowerCase())).size === v.length)
    .optional(),
  status: z.enum(applicationStatuses).optional(),
  notes: z.string().max(1000).optional(),
});
export type ApplicationInput = z.infer<typeof applicationInput>;
