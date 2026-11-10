import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../../db/client.js";
import {
  applicationDocuments,
  applicationDocumentSlots,
  documentReviews,
} from "../../db/schema/documents.js";
import { auditEvents } from "../../db/schema/audit.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error.js";
import {
  findApplication,
  getDocuments,
} from "../applications/application.repository.js";
import { createStorage, type UploadFile } from "./document.storage.js";

const reviewInput = z
  .strictObject({
    status: z.enum([
      "Menunggu pemeriksaan",
      "Terverifikasi",
      "Perlu perbaikan",
    ]),
    reviewNote: z.string().trim().max(400),
    receivedPhysically: z.boolean().optional(),
  })
  .refine(
    (v) => v.status !== "Perlu perbaikan" || v.reviewNote.length > 0,
    "Tulis catatan perbaikan.",
  );
const states = {
  "Menunggu pemeriksaan": "pending",
  Terverifikasi: "verified",
  "Perlu perbaikan": "needs_correction",
} as const;
export function createDocumentService(
  db: Database,
  storage: ReturnType<typeof createStorage>,
) {
  return {
    async review(
      number: string,
      slotId: string,
      input: unknown,
      adminId: string,
    ) {
      const v = reviewInput.parse(input);
      z.uuid().parse(slotId);
      return db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtextextended(${number}, 0))`,
        );
        const app = await findApplication(tx, number);
        const [slot] = await tx
          .select()
          .from(applicationDocumentSlots)
          .where(
            and(
              eq(applicationDocumentSlots.id, slotId),
              eq(applicationDocumentSlots.applicationId, app.id),
            ),
          )
          .for("update");
        if (!slot) throw new NotFoundError();
        const receivedPhysically =
          v.receivedPhysically ?? slot.receivedPhysically;
        if (!slot.currentVersionId && !receivedPhysically)
          throw new ConflictError(
            "Berkas belum diterima. Catat penerimaan fisik atau minta pendaftar mengunggah berkas.",
          );
        await tx
          .update(applicationDocumentSlots)
          .set({
            status: states[v.status],
            receivedPhysically,
            reviewNote: v.reviewNote,
            reviewedAt: new Date(),
            reviewedBy: adminId,
          })
          .where(eq(applicationDocumentSlots.id, slot.id));
        await tx.insert(documentReviews).values({
          slotId: slot.id,
          versionId: slot.currentVersionId,
          status: states[v.status],
          receivedPhysically,
          note: v.reviewNote,
          reviewedBy: adminId,
        });
        await tx.insert(auditEvents).values({
          adminId,
          action: "document.review",
          resourceType: "application",
          resourceId: number,
        });
        return (await getDocuments(tx, app.id)).find((d) => d.id === slotId)!;
      });
    },
    async replace(
      applicationId: string,
      accountId: string | null,
      file: UploadFile,
      adminId?: string,
    ) {
      let storageKey: string | undefined;
      try {
        return await db.transaction(async (tx) => {
          const [slot] = await tx
            .select()
            .from(applicationDocumentSlots)
            .where(
              and(
                eq(applicationDocumentSlots.applicationId, applicationId),
                eq(applicationDocumentSlots.kind, file.kind),
              ),
            )
            .for("update");
          if (!slot) throw new NotFoundError();
          if (slot.status === "verified")
            throw new ConflictError(
              "Berkas sudah diverifikasi. Hubungi panitia untuk membuka perbaikan.",
            );
          storageKey = await storage.save(file);
          const [version] = await tx
            .insert(applicationDocuments)
            .values({
              applicationId,
              slotId: slot.id,
              documentType: file.kind,
              originalName: file.originalName,
              storageKey,
              mimeType: file.mimeType,
              fileSize: file.bytes.length,
            })
            .returning();
          await tx
            .update(applicationDocumentSlots)
            .set({
              currentVersionId: version!.id,
              status: "pending",
              reviewNote: null,
              reviewedAt: null,
              reviewedBy: null,
            })
            .where(eq(applicationDocumentSlots.id, slot.id));
          await tx.insert(auditEvents).values({
            applicantAccountId: accountId,
            adminId: adminId ?? null,
            action: "document.replace",
            resourceType: "document",
            resourceId: slot.id,
          });
          return (await getDocuments(tx, applicationId)).find(
            (d) => d.id === slot.id,
          )!;
        });
      } catch (e) {
        if (storageKey) await storage.remove(storageKey);
        throw e;
      }
    },
    async download(applicationId: string, slotId: string) {
      z.uuid().parse(slotId);
      const [row] = await db
        .select({ file: applicationDocuments })
        .from(applicationDocumentSlots)
        .innerJoin(
          applicationDocuments,
          eq(
            applicationDocumentSlots.currentVersionId,
            applicationDocuments.id,
          ),
        )
        .where(
          and(
            eq(applicationDocumentSlots.id, slotId),
            eq(applicationDocumentSlots.applicationId, applicationId),
          ),
        );
      if (!row) throw new NotFoundError("Berkas digital tidak tersedia.");
      if (
        !["application/pdf", "image/jpeg", "image/png"].includes(
          row.file.mimeType,
        )
      )
        throw new AppError(
          "Jenis berkas tidak dapat diunduh.",
          422,
          "INVALID_FILE",
        );
      return {
        bytes: await storage.read(row.file.storageKey),
        name: row.file.originalName,
        mime: row.file.mimeType,
      };
    },
  };
}
