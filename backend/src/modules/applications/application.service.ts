import { createHash } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../../db/client.js";
import {
  applications,
  applicationChoices,
  applicationStatusHistory,
  submissionRequests,
} from "../../db/schema/applications.js";
import {
  applicationDocumentSlots,
  applicationDocuments,
} from "../../db/schema/documents.js";
import { applicantAccounts } from "../../db/schema/applicant-auth.js";
import { schoolSettings } from "../../db/schema/settings.js";
import { clubs } from "../../db/schema/clubs.js";
import { auditEvents } from "../../db/schema/audit.js";
import { AppError, ConflictError } from "../../shared/errors/app-error.js";
import { ensureSettings } from "../settings/settings.service.js";
import {
  createStorage,
  type UploadFile,
} from "../documents/document.storage.js";
import {
  onlineInput,
  offlineInput,
  applicationUpdate,
  uploadKinds,
  statusToDb,
  type ApplicationInput,
} from "./application.schema.js";
import {
  applicationRecord,
  findApplication,
  getDocuments,
  requirementsMet,
  type Transaction,
} from "./application.repository.js";

async function selectedClubs(
  tx: Transaction,
  names: string[],
  historical: { clubId: string | null; nameSnapshot: string }[] = [],
) {
  const active = await tx.select().from(clubs).where(eq(clubs.active, true));
  return names.map((name) => {
    const row = active.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (row) return { id: row.id, name: row.name };
    const previous = historical.find(
      (c) => c.nameSnapshot.toLowerCase() === name.toLowerCase(),
    );
    if (previous) return { id: previous.clubId, name: previous.nameSnapshot };
    throw new AppError(
      `Ekstrakurikuler ${name} tidak aktif atau tidak ditemukan.`,
      422,
      "INVALID_CLUB",
    );
  });
}
const fields = (v: ApplicationInput) => ({
  studentName: v.studentName,
  nisn: v.nisn,
  originSchool: v.originSchool,
  birthPlace: v.birthPlace,
  birthDate: new Date(`${v.birthDate}T00:00:00Z`),
  gender: v.gender,
  address: v.address,
  parentName: v.parentName,
  parentOccupation: v.parentOccupation,
  phone: v.phone,
  email: v.email,
});

export function createApplicationService(
  db: Database,
  storage: ReturnType<typeof createStorage>,
) {
  return {
    async submit(
      input: unknown,
      files: UploadFile[],
      key: string,
      adminId?: string,
    ) {
      z.uuid().parse(key);
      const value = adminId
        ? offlineInput.parse(input)
        : onlineInput.parse(input);
      const offline = adminId ? offlineInput.parse(input) : null;
      const payloadHash = createHash("sha256")
        .update(
          JSON.stringify({
            value,
            source: adminId ? "offline" : "website",
            files: files
              .map((f) => ({
                kind: f.kind,
                name: f.originalName,
                sha: createHash("sha256").update(f.bytes).digest("hex"),
              }))
              .sort((a, b) => a.kind.localeCompare(b.kind)),
          }),
        )
        .digest("hex");
      const passwordHash =
        "password" in value ? await hash(value.password) : null;
      await ensureSettings(db);
      const written: string[] = [];
      try {
        return await db.transaction(async (tx) => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`,
          );
          const [existing] = await tx
            .select()
            .from(submissionRequests)
            .where(eq(submissionRequests.key, key));
          if (existing) {
            if (existing.payloadHash !== payloadHash)
              throw new ConflictError(
                "Kunci pengiriman sudah dipakai untuk data berbeda.",
              );
            if (existing.receipt) return existing.receipt;
            throw new ConflictError("Pengiriman masih diproses. Coba lagi.");
          }
          const [settings] = await tx
            .select()
            .from(schoolSettings)
            .where(eq(schoolSettings.id, 1))
            .for("share");
          if (!settings!.registrationOpen && !adminId)
            throw new AppError(
              "Pendaftaran sedang ditutup.",
              409,
              "REGISTRATION_CLOSED",
            );
          if (
            !adminId &&
            !requirementsMet(
              settings!.documentRequirements,
              files.map((f) => f.kind),
            )
          )
            throw new AppError(
              "Berkas wajib belum lengkap sesuai pengaturan sekolah.",
              422,
              "MISSING_DOCUMENTS",
            );
          const choices = await selectedClubs(tx, value.extracurriculars);
          await tx
            .insert(submissionRequests)
            .values({
              key,
              payloadHash,
              expiresAt: new Date(Date.now() + 86400000),
            });
          const [row] = await tx
            .insert(applications)
            .values({
              ...fields(value),
              academicYear: settings!.academicYear,
              documentRequirements: settings!.documentRequirements,
              source: adminId ? "offline" : "website",
              notes: offline?.notes ?? "",
            })
            .returning();
          if (choices.length)
            await tx
              .insert(applicationChoices)
              .values(
                choices.map((c, sortOrder) => ({
                  applicationId: row!.id,
                  clubId: c.id,
                  nameSnapshot: c.name,
                  sortOrder,
                })),
              );
          for (const kind of uploadKinds) {
            const file = files.find((f) => f.kind === kind);
            const physical = Boolean(
              offline?.receivedDocumentKinds.includes(kind),
            );
            const [slot] = await tx
              .insert(applicationDocumentSlots)
              .values({
                applicationId: row!.id,
                kind,
                receivedPhysically: physical,
                status: physical ? "pending" : "missing",
              })
              .returning();
            if (file) {
              const storageKey = await storage.save(file);
              written.push(storageKey);
              const [version] = await tx
                .insert(applicationDocuments)
                .values({
                  applicationId: row!.id,
                  slotId: slot!.id,
                  documentType: kind,
                  originalName: file.originalName,
                  storageKey,
                  mimeType: file.mimeType,
                  fileSize: file.bytes.length,
                })
                .returning();
              await tx
                .update(applicationDocumentSlots)
                .set({ currentVersionId: version!.id, status: "pending" })
                .where(eq(applicationDocumentSlots.id, slot!.id));
            }
          }
          await tx
            .insert(applicantAccounts)
            .values({
              applicationId: row!.id,
              passwordHash,
              activatedAt: passwordHash ? new Date() : null,
            });
          await tx
            .insert(applicationStatusHistory)
            .values({
              applicationId: row!.id,
              toStatus: "verification",
              changedBy: adminId ?? null,
              reason: "Pendaftaran diterima.",
            });
          await tx
            .insert(auditEvents)
            .values({
              adminId: adminId ?? null,
              action: "application.create",
              resourceType: "application",
              resourceId: row!.registrationNumber,
            });
          const receipt = {
            id: row!.registrationNumber,
            status: "Verifikasi",
            submittedAt: row!.submittedAt.toISOString(),
          };
          await tx
            .update(submissionRequests)
            .set({ applicationId: row!.id, state: "completed", receipt })
            .where(eq(submissionRequests.key, key));
          return receipt;
        });
      } catch (error) {
        await Promise.all(written.map((k) => storage.remove(k)));
        throw error;
      }
    },
    async update(number: string, input: unknown, adminId: string) {
      const v = applicationUpdate.parse(input);
      return db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtextextended(${number}, 0))`,
        );
        const current = await findApplication(tx, number);
        if (v.status && ["Terverifikasi", "Diterima"].includes(v.status)) {
          const docs = await getDocuments(tx, current.id);
          if (
            !requirementsMet(
              current.documentRequirements ?? {
                requiredKinds: [],
                requireOneGraduationDocument: false,
              },
              docs
                .filter((d) => d.status === "Terverifikasi")
                .map((d) => d.kind),
            )
          )
            throw new ConflictError(
              "Verifikasi semua berkas wajib sebelum menetapkan status ini.",
            );
        }
        const { extracurriculars, birthDate, status, ...rest } = v;
        const [updated] = await tx
          .update(applications)
          .set({
            ...rest,
            ...(birthDate
              ? { birthDate: new Date(`${birthDate}T00:00:00Z`) }
              : {}),
            ...(status ? { status: statusToDb[status] } : {}),
          })
          .where(eq(applications.id, current.id))
          .returning();
        if (extracurriculars) {
          const historical = await tx
            .select()
            .from(applicationChoices)
            .where(eq(applicationChoices.applicationId, current.id));
          const selected = await selectedClubs(
            tx,
            extracurriculars,
            historical,
          );
          await tx
            .delete(applicationChoices)
            .where(eq(applicationChoices.applicationId, current.id));
          if (selected.length)
            await tx
              .insert(applicationChoices)
              .values(
                selected.map((c, sortOrder) => ({
                  applicationId: current.id,
                  clubId: c.id,
                  nameSnapshot: c.name,
                  sortOrder,
                })),
              );
        }
        if (status && statusToDb[status] !== current.status)
          await tx
            .insert(applicationStatusHistory)
            .values({
              applicationId: current.id,
              fromStatus: current.status,
              toStatus: statusToDb[status],
              changedBy: adminId,
              reason: v.notes ?? "Status diperbarui admin.",
            });
        await tx
          .insert(auditEvents)
          .values({
            adminId,
            action: "application.update",
            resourceType: "application",
            resourceId: number,
          });
        return applicationRecord(tx, updated!);
      });
    },
  };
}
