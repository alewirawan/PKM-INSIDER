import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { admins } from "./auth.js";

export const applicationStatus = pgEnum("application_status", [
  "verification",
  "verified",
  "interview",
  "accepted",
  "rejected",
]);

export const registrationSource = pgEnum("registration_source", [
  "website",
  "offline",
]);

export const documentStatus = pgEnum("document_status", [
  "uploaded",
  "verified",
  "rejected",
]);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationNumber: varchar("registration_number", {
      length: 32,
    }).notNull(),
    studentName: varchar("student_name", { length: 160 }).notNull(),
    nisn: varchar("nisn", { length: 10 }),
    originSchool: varchar("origin_school", { length: 180 }).notNull(),
    birthPlace: varchar("birth_place", { length: 100 }),
    birthDate: date("birth_date", { mode: "date" }),
    gender: varchar("gender", { length: 20 }),
    address: text("address"),
    parentName: varchar("parent_name", { length: 160 }),
    parentOccupation: varchar("parent_occupation", { length: 120 }),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 254 }),
    program: varchar("program", { length: 120 }).notNull(),
    status: applicationStatus("status").notNull().default("verification"),
    source: registrationSource("source").notNull().default("website"),
    notes: text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("applications_registration_number_uq").on(
      table.registrationNumber,
    ),
    index("applications_student_name_idx").on(table.studentName),
    index("applications_nisn_idx").on(table.nisn),
    index("applications_status_idx").on(table.status),
    index("applications_submitted_idx").on(table.submittedAt),
  ],
);

export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    documentType: varchar("document_type", { length: 40 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSize: integer("file_size").notNull(),
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
  ],
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
