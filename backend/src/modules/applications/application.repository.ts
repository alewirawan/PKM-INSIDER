import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../../db/client.js";
import {
  applications,
  applicationChoices,
} from "../../db/schema/applications.js";
import {
  applicationDocumentSlots,
  applicationDocuments,
} from "../../db/schema/documents.js";
import type { DocumentRequirements } from "../../db/schema/common.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import {
  statusToDb,
  statusToUi,
  applicationStatuses,
} from "./application.schema.js";

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type Db = Database | Transaction;
export const labels = {
  skl: "Surat Keterangan Lulus",
  ijazah: "Ijazah",
  kk: "Kartu Keluarga",
  ktp: "KTP orang tua/wali",
  kip: "PIP / KIP",
  akta: "Akta kelahiran",
  photo: "Pas foto",
};
export const docStatuses = {
  missing: "Belum ada",
  pending: "Menunggu pemeriksaan",
  verified: "Terverifikasi",
  needs_correction: "Perlu perbaikan",
} as const;
export async function findApplication(db: Db, number: string) {
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.registrationNumber, number));
  if (!row) throw new NotFoundError("Pendaftar tidak ditemukan.");
  return row;
}
export async function getDocuments(db: Db, id: string) {
  const rows = await db
    .select({ slot: applicationDocumentSlots, file: applicationDocuments })
    .from(applicationDocumentSlots)
    .leftJoin(
      applicationDocuments,
      eq(applicationDocumentSlots.currentVersionId, applicationDocuments.id),
    )
    .where(eq(applicationDocumentSlots.applicationId, id))
    .orderBy(asc(applicationDocumentSlots.kind));
  return rows.map(({ slot: s, file: f }) => ({
    id: s.id,
    kind: s.kind,
    label: labels[s.kind],
    status: docStatuses[s.status],
    hasFile: Boolean(f),
    receivedPhysically: s.receivedPhysically,
    reviewNote: s.reviewNote ?? "",
    reviewedAt: s.reviewedAt?.toISOString() ?? null,
    reviewedBy: s.reviewedBy,
    ...(f
      ? {
          fileName: f.originalName,
          mimeType: f.mimeType,
          size: f.fileSize,
          uploadedAt: f.uploadedAt.toISOString(),
        }
      : {}),
  }));
}
export async function applicationRecord(
  db: Db,
  row: typeof applications.$inferSelect,
) {
  const [documents, choices] = await Promise.all([
    getDocuments(db, row.id),
    db
      .select()
      .from(applicationChoices)
      .where(eq(applicationChoices.applicationId, row.id))
      .orderBy(asc(applicationChoices.sortOrder)),
  ]);
  return {
    id: row.registrationNumber,
    studentName: row.studentName,
    nisn: row.nisn ?? "",
    originSchool: row.originSchool,
    birthPlace: row.birthPlace ?? "",
    birthDate: row.birthDate?.toISOString().slice(0, 10) ?? "",
    gender: row.gender ?? "",
    address: row.address ?? "",
    parentName: row.parentName ?? "",
    parentOccupation: row.parentOccupation ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    status: statusToUi[row.status],
    source: row.source === "website" ? "Website" : "Offline",
    submittedAt: row.submittedAt.toISOString(),
    notes: row.notes ?? "",
    documents,
    extracurriculars: choices.map((c) => c.nameSnapshot),
    documentRequirements: row.documentRequirements ?? {
      requiredKinds: [],
      requireOneGraduationDocument: false,
    },
  };
}
export function requirementsMet(
  requirements: DocumentRequirements,
  available: string[],
) {
  return (
    requirements.requiredKinds.every((k) => available.includes(k)) &&
    (!requirements.requireOneGraduationDocument ||
      available.some((k) => k === "skl" || k === "ijazah"))
  );
}
export async function listApplications(db: Database, query: unknown) {
  const q = z
    .object({
      search: z.string().max(120).default(""),
      status: z.enum(applicationStatuses).optional(),
      source: z.enum(["Website", "Offline"]).optional(),
      cursor: z.uuid().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
    })
    .parse(query);
  const term = q.search.replace(/[\\%_]/g, "\\$&");
  const [cursor] = q.cursor
    ? await db
        .select({ submittedAt: applications.submittedAt, id: applications.id })
        .from(applications)
        .where(eq(applications.id, q.cursor))
    : [];
  if (q.cursor && !cursor)
    throw new NotFoundError(
      "Posisi halaman tidak ditemukan. Muat ulang pencarian.",
    );
  const rows = await db
    .select()
    .from(applications)
    .where(
      and(
        q.search
          ? or(
              ilike(applications.studentName, `%${term}%`),
              ilike(applications.nisn, `%${term}%`),
              ilike(applications.registrationNumber, `%${term}%`),
            )
          : undefined,
        q.status ? eq(applications.status, statusToDb[q.status]) : undefined,
        q.source
          ? eq(
              applications.source,
              q.source === "Website" ? "website" : "offline",
            )
          : undefined,
        cursor
          ? sql`(${applications.submittedAt}, ${applications.id}) < (SELECT submitted_at, id FROM applications WHERE id = ${cursor.id}::uuid)`
          : undefined,
      ),
    )
    .orderBy(desc(applications.submittedAt), desc(applications.id))
    .limit(q.limit + 1);
  const page = rows.slice(0, q.limit);
  return {
    items: await Promise.all(page.map((row) => applicationRecord(db, row))),
    nextCursor: rows.length > q.limit ? page.at(-1)!.id : null,
  };
}
