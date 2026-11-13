import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps, type DocumentRequirements } from "./common.js";

export const admissionPeriods = pgTable(
  "admission_periods",
  {
    academicYear: varchar("academic_year", { length: 9 }).primaryKey(),
    ...timestamps(),
  },
  (table) => [
    check(
      "admission_periods_year_ck",
      sql`${table.academicYear} ~ '^[0-9]{4}/[0-9]{4}$' AND substring(${table.academicYear}, 6, 4)::int = substring(${table.academicYear}, 1, 4)::int + 1`,
    ),
  ],
);

export const schoolSettings = pgTable(
  "school_settings",
  {
    id: integer("id").primaryKey().default(1),
    schoolName: varchar("school_name", { length: 120 }).notNull(),
    tagline: varchar("tagline", { length: 160 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    ppdbEmail: varchar("ppdb_email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 30 }).notNull(),
    address: varchar("address", { length: 500 }).notNull(),
    academicYear: varchar("academic_year", { length: 9 }).notNull(),
    registrationOpen: boolean("registration_open").notNull().default(false),
    registrationOpensAt: timestamp("registration_opens_at", {
      withTimezone: true,
    }),
    registrationClosesAt: timestamp("registration_closes_at", {
      withTimezone: true,
    }),
    documentRequirements: jsonb("document_requirements")
      .$type<DocumentRequirements>()
      .notNull(),
    dataRetention: varchar("data_retention", { length: 16 })
      .notNull()
      .default("indefinite"),
    ...timestamps(),
  },
  (table) => [
    check("school_settings_singleton_ck", sql`${table.id} = 1`),
    foreignKey({
      name: "school_settings_period_fk",
      columns: [table.academicYear],
      foreignColumns: [admissionPeriods.academicYear],
    }).onDelete("restrict"),
    check(
      "school_settings_requirements_ck",
      sql`nh_valid_document_requirements(${table.documentRequirements})`,
    ),
    check(
      "school_settings_retention_ck",
      sql`${table.dataRetention} = 'indefinite'`,
    ),
    check(
      "school_settings_dates_ck",
      sql`${table.registrationOpensAt} IS NULL OR ${table.registrationClosesAt} IS NULL OR ${table.registrationClosesAt} > ${table.registrationOpensAt}`,
    ),
    check(
      "school_settings_text_ck",
      sql`length(btrim(${table.schoolName})) >= 2 AND length(btrim(${table.tagline})) >= 2 AND length(btrim(${table.address})) >= 10 AND (${table.phone} = '' OR length(${table.phone}) BETWEEN 8 AND 30) AND (${table.whatsapp} = '' OR length(${table.whatsapp}) BETWEEN 8 AND 30)`,
    ),
  ],
);
