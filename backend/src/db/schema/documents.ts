import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { applications } from "./applications.js";
import { admins } from "./auth.js";

export const documentStatus = pgEnum("document_status", [
  "uploaded",
  "verified",
  "rejected",
]);
export const documentKind = pgEnum("document_kind", [
  "skl",
  "ijazah",
  "kk",
  "ktp",
  "kip",
  "akta",
  "photo",
  "rapor",
  "pasfoto",
]);
export const documentReviewStatus = pgEnum("document_review_status", [
  "missing",
  "pending",
  "verified",
  "needs_correction",
]);

function versionIdentityColumns(): [AnyPgColumn, AnyPgColumn] {
  return [applicationDocuments.id, applicationDocuments.slotId];
}

export const applicationDocumentSlots = pgTable(
  "application_document_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "restrict" }),
    kind: documentKind("kind").notNull(),
    currentVersionId: uuid("current_version_id"),
    status: documentReviewStatus("status").notNull().default("missing"),
    receivedPhysically: boolean("received_physically").notNull().default(false),
    reviewNote: varchar("review_note", { length: 400 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => admins.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("document_slots_application_kind_uq").on(
      table.applicationId,
      table.kind,
    ),
    unique("document_slots_id_application_uq").on(
      table.id,
      table.applicationId,
    ),
    foreignKey({
      name: "document_slots_current_version_fk",
      columns: [table.currentVersionId, table.id],
      foreignColumns: versionIdentityColumns(),
    }).onDelete("restrict"),
    check(
      "document_slots_presence_ck",
      sql`(${table.status} = 'missing' AND ${table.currentVersionId} IS NULL AND NOT ${table.receivedPhysically}) OR (${table.status} <> 'missing' AND (${table.currentVersionId} IS NOT NULL OR ${table.receivedPhysically}))`,
    ),
    check(
      "document_slots_review_note_ck",
      sql`${table.status} <> 'needs_correction' OR (${table.reviewNote} IS NOT NULL AND length(btrim(${table.reviewNote})) > 0)`,
    ),
    index("document_slots_status_idx").on(table.status, table.applicationId),
  ],
);

export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "restrict" }),
    slotId: uuid("slot_id").notNull(),
    documentType: varchar("document_type", { length: 40 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSize: integer("file_size").notNull(),
    schemaVersion: integer("schema_version").notNull().default(2),
    status: documentStatus("status").notNull().default("uploaded"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => admins.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("application_documents_storage_key_uq").on(table.storageKey),
    index("application_documents_application_idx").on(table.applicationId),
    unique("application_documents_id_slot_uq").on(table.id, table.slotId),
    foreignKey({
      name: "application_documents_slot_owner_fk",
      columns: [table.slotId, table.applicationId],
      foreignColumns: [
        applicationDocumentSlots.id,
        applicationDocumentSlots.applicationId,
      ],
    }).onDelete("restrict"),
    index("application_documents_slot_date_idx").on(
      table.slotId,
      table.uploadedAt,
    ),
    check(
      "application_documents_schema_version_ck",
      sql`${table.schemaVersion} IN (1, 2)`,
    ),
    check(
      "application_documents_v2_file_ck",
      sql`${table.schemaVersion} = 1 OR (${table.fileSize} BETWEEN 1 AND 5242880 AND ${table.mimeType} IN ('application/pdf', 'image/jpeg', 'image/png') AND length(btrim(${table.originalName})) > 0 AND length(btrim(${table.storageKey})) > 0)`,
    ),
  ],
);

export const documentReviews = pgTable(
  "document_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => applicationDocumentSlots.id, { onDelete: "restrict" }),
    versionId: uuid("version_id"),
    status: documentReviewStatus("status").notNull(),
    receivedPhysically: boolean("received_physically").notNull(),
    note: varchar("note", { length: 400 }).notNull().default(""),
    reviewedBy: uuid("reviewed_by").references(() => admins.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "document_reviews_version_owner_fk",
      columns: [table.versionId, table.slotId],
      foreignColumns: versionIdentityColumns(),
    }).onDelete("restrict"),
    check(
      "document_reviews_status_ck",
      sql`${table.status} <> 'missing' AND (${table.versionId} IS NOT NULL OR ${table.receivedPhysically}) AND (${table.status} <> 'needs_correction' OR length(btrim(${table.note})) > 0)`,
    ),
    index("document_reviews_slot_date_idx").on(table.slotId, table.reviewedAt),
  ],
);
