import { sql } from "drizzle-orm";
import {
  check,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { timestamps } from "./common.js";

export const teacherCluster = pgEnum("teacher_cluster", [
  "Sains",
  "Bahasa",
  "Sosial",
  "Kreatif & Karakter",
]);
export const leaderLevel = pgEnum("leader_level", [
  "principal",
  "leadership",
  "support",
]);

export const teachers = pgTable(
  "teachers",
  {
    id: varchar("id", { length: 120 }).primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    initials: varchar("initials", { length: 3 }).notNull(),
    subject: varchar("subject", { length: 120 }).notNull(),
    cluster: teacherCluster("cluster"),
    years: integer("years"),
    note: varchar("note", { length: 300 }).notNull(),
    tone: varchar("tone", { length: 30 }).notNull(),
    portraitIndex: integer("portrait_index").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    check(
      "teachers_values_ck",
      sql`${table.years} BETWEEN 0 AND 60 AND ${table.portraitIndex} BETWEEN 0 AND 7 AND ${table.sortOrder} >= 0`,
    ),
    check(
      "teachers_text_ck",
      sql`length(btrim(${table.name})) >= 2 AND length(btrim(${table.initials})) >= 1 AND length(btrim(${table.subject})) >= 2 AND length(btrim(${table.note})) >= 2`,
    ),
    index("teachers_order_idx").on(table.sortOrder, table.id),
  ],
);

export const schoolLeaders = pgTable(
  "school_leaders",
  {
    id: varchar("id", { length: 120 }).primaryKey(),
    parentId: varchar("parent_id", { length: 120 }).references(
      (): AnyPgColumn => schoolLeaders.id,
      { onDelete: "set null" },
    ),
    coordination: boolean("coordination").notNull().default(false),
    teacherId: varchar("teacher_id", { length: 120 }).references(
      () => teachers.id,
      { onDelete: "set null" },
    ),
    name: varchar("name", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    initials: varchar("initials", { length: 3 }).notNull(),
    focus: varchar("focus", { length: 240 }).notNull(),
    tone: varchar("tone", { length: 30 }).notNull(),
    level: leaderLevel("level").notNull(),
    portraitIndex: integer("portrait_index").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("school_leaders_one_principal_uq")
      .on(table.level)
      .where(sql`${table.level} = 'principal'`),
    check(
      "school_leaders_values_ck",
      sql`${table.portraitIndex} BETWEEN 0 AND 7 AND ${table.sortOrder} >= 0`,
    ),
    check(
      "school_leaders_text_ck",
      sql`length(btrim(${table.name})) >= 2 AND length(btrim(${table.role})) >= 2 AND length(btrim(${table.initials})) >= 1 AND length(btrim(${table.focus})) >= 2`,
    ),
    index("school_leaders_order_idx").on(
      table.level,
      table.sortOrder,
      table.id,
    ),
  ],
);
