import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase } from "../src/db/client.js";
import { migrateSchoolDatabase } from "../src/db/migrate.js";
import { seedSchoolProfile } from "../src/db/seed-school.js";
import { seedSchoolOrganization } from "../src/db/seed-organization.js";
import { seedTeacherSubjects } from "../src/db/seed-teacher-subjects.js";
import { schoolProfile } from "../src/config/school-profile.js";
import {
  admissionPeriods,
  applications,
  schoolSettings,
  teachers,
  posts,
  admins,
  schoolLeaders,
} from "../src/db/schema/index.js";
import { settingsInput } from "../src/modules/settings/settings.schema.js";
import { initialSettings } from "../src/modules/settings/settings.service.js";
import { directoryInput } from "../src/modules/directory/directory.schema.js";
import { documentKindInput } from "../src/modules/applications/application.schema.js";

it("accepts school contact gaps and new document kinds without inventing teacher details", () => {
  expect(
    settingsInput.safeParse({ ...initialSettings, phone: "", whatsapp: "" })
      .success,
  ).toBe(true);
  expect(
    settingsInput.safeParse({ ...initialSettings, phone: "123" }).success,
  ).toBe(false);
  expect(
    settingsInput.safeParse({
      ...initialSettings,
      documentRequirements: {
        requiredKinds: ["rapor", "pasfoto"],
        requireOneGraduationDocument: false,
      },
    }).success,
  ).toBe(true);
  expect(
    settingsInput.safeParse({
      ...initialSettings,
      documentRequirements: {
        requiredKinds: ["kip"],
        requireOneGraduationDocument: false,
      },
    }).success,
  ).toBe(false);
  expect(documentKindInput.safeParse("photo").success).toBe(false);
  expect(documentKindInput.safeParse("rapor").success).toBe(true);
  expect(documentKindInput.safeParse("pasfoto").success).toBe(true);
  expect(
    directoryInput.safeParse({
      leaders: [],
      teachers: [
        {
          ...schoolProfile.teachers[0],
          subject: "Tenaga pendidik",
          cluster: null,
          years: null,
          note: "SMP Nurul Huda Cisoka",
          tone: "sage",
          portraitIndex: 0,
        },
      ],
    }).success,
  ).toBe(true);
});

const url = process.env.SCHOOL_PROFILE_DATABASE_URL;
describe.skipIf(!url)("school content initialization with PostgreSQL", () => {
  let connection: ReturnType<typeof createDatabase>;
  let oldApplicationId: string;
  const oldRequirements = {
    requiredKinds: ["kk"] as "kk"[],
    requireOneGraduationDocument: false,
  };
  beforeAll(async () => {
    const target = new URL(url!);
    if (
      !["localhost", "127.0.0.1", "postgres"].includes(target.hostname) ||
      !/^\/nh_profile_test(?:_[a-z0-9]+)?$/.test(target.pathname)
    )
      throw new Error("Use a dedicated local nh_profile_test database.");
    connection = createDatabase(url!);
    await migrateSchoolDatabase(connection);
    await connection.db
      .insert(admissionPeriods)
      .values({ academicYear: "2026/2027" })
      .onConflictDoNothing();
    await connection.db.insert(schoolSettings).values({
      ...initialSettings,
      email: "sekolah@example.test",
      address:
        "Alamat sekolah belum diatur. Silakan perbarui melalui Pengaturan.",
      registrationOpen: false,
    });
    const [row] = await connection.db
      .insert(applications)
      .values({
        studentName: "Siswa Uji Profil",
        nisn: "9876543210",
        originSchool: "SD Pengujian",
        birthPlace: "Kota Uji",
        birthDate: new Date("2013-01-01"),
        gender: "Perempuan",
        address: "Alamat fiktif untuk pengujian",
        parentName: "Wali Pengujian",
        phone: "0800000000",
        email: "wali@example.test",
        academicYear: "2026/2027",
        documentRequirements: oldRequirements,
      })
      .returning({ id: applications.id });
    oldApplicationId = row!.id;
  });
  afterAll(async () => {
    await connection?.client.end();
  });

  it("imports actual content and adds optional slots without changing an existing registration policy", async () => {
    expect(await seedSchoolProfile(connection.db)).toBe(true);
    const [settings] = await connection.db.select().from(schoolSettings);
    expect(settings?.email).toBe(schoolProfile.email);
    expect(settings?.phone).toBe("");
    expect(settings?.registrationOpen).toBe(true);
    const staff = await connection.db.select().from(teachers);
    expect(staff).toHaveLength(16);
    expect(
      staff.every(
        (teacher) => teacher.years === null && teacher.cluster === null,
      ),
    ).toBe(true);
    const [oldApplication] = await connection.db
      .select()
      .from(applications)
      .where(eq(applications.id, oldApplicationId));
    expect(oldApplication?.documentRequirements).toEqual(oldRequirements);
    const slots =
      await connection.client`SELECT kind FROM application_document_slots WHERE application_id=${oldApplicationId}`;
    expect(slots.map((slot) => slot.kind).sort()).toEqual(["pasfoto", "rapor"]);
    const [article] = await connection.db
      .select()
      .from(posts)
      .where(eq(posts.slug, schoolProfile.event.slug));
    expect(article?.status).toBe("Terbit");
    expect(await connection.db.select().from(admins)).toHaveLength(0);
    await connection.db.update(schoolSettings).set({
      documentRequirements: {
        requiredKinds: ["rapor", "pasfoto"],
        requireOneGraduationDocument: false,
      },
    });
  });

  it("does not overwrite an admin's edits when initialization runs again", async () => {
    await connection.db.update(schoolSettings).set({ registrationOpen: false });
    await connection.db
      .update(teachers)
      .set({ subject: "Matematika" })
      .where(eq(teachers.id, schoolProfile.teachers[0]!.id));
    await connection.db
      .update(posts)
      .set({ status: "Draft" })
      .where(eq(posts.id, schoolProfile.event.id));
    expect(await seedSchoolProfile(connection.db)).toBe(false);
    const [settings] = await connection.db.select().from(schoolSettings);
    const [teacher] = await connection.db
      .select()
      .from(teachers)
      .where(eq(teachers.id, schoolProfile.teachers[0]!.id));
    const [article] = await connection.db
      .select()
      .from(posts)
      .where(eq(posts.id, schoolProfile.event.id));
    expect(settings?.registrationOpen).toBe(false);
    expect(teacher?.subject).toBe("Matematika");
    expect(article?.status).toBe("Draft");
  });
  it("updates placeholder subjects once while preserving existing admin changes", async () => {
    await connection.db
      .update(teachers)
      .set({ subject: "Guru Bidang Studi" })
      .where(eq(teachers.id, "nh-rehan"));
    await connection.db
      .update(teachers)
      .set({ name: "Bpk. Hasan, S.Kom." })
      .where(eq(teachers.id, "nh-hasan"));
    expect(await seedTeacherSubjects(connection.db)).toBe(true);
    const people = await connection.db.select().from(teachers);
    expect(people.find((p) => p.id === "nh-rehan")?.subject).toBe("PJOK");
    expect(people.find((p) => p.id === "nh-hasan")?.name).toBe(
      "Bpk. Hasan, S.Pd",
    );
    expect(people.find((p) => p.id === "nh-julian")?.subject).toBe(
      "Tata Usaha",
    );
    expect(people.find((p) => p.id === "nh-fajar-anwar")?.subject).toBe(
      "Matematika",
    );
    await connection.db
      .update(teachers)
      .set({ subject: "Suntingan admin" })
      .where(eq(teachers.id, "nh-rehan"));
    expect(await seedTeacherSubjects(connection.db)).toBe(false);
    const [saved] = await connection.db
      .select()
      .from(teachers)
      .where(eq(teachers.id, "nh-rehan"));
    expect(saved?.subject).toBe("Suntingan admin");
  });
  it("initializes the chart with coordination links once and preserves later edits", async () => {
    expect(await seedSchoolOrganization(connection.db)).toBe(true);
    const leaders = await connection.db.select().from(schoolLeaders);
    expect(leaders).toHaveLength(13);
    expect(leaders.find((person) => person.id === "org-kepala")?.parentId).toBe(
      "org-yayasan",
    );
    expect(
      leaders.find((person) => person.id === "org-komite")?.coordination,
    ).toBe(true);
    expect(
      leaders.find((person) => person.id === "org-keamanan")?.parentId,
    ).toBe("org-bendahara");
    await connection.db
      .update(schoolLeaders)
      .set({ name: "Nama hasil suntingan" })
      .where(eq(schoolLeaders.id, "org-kepala"));
    expect(await seedSchoolOrganization(connection.db)).toBe(false);
    const [saved] = await connection.db
      .select()
      .from(schoolLeaders)
      .where(eq(schoolLeaders.id, "org-kepala"));
    expect(saved?.name).toBe("Nama hasil suntingan");
  });
});

it("rejects missing parents and circular reporting or coordination relationships", () => {
  const valid = { leaders: schoolProfile.leaders, teachers: [] };
  expect(directoryInput.safeParse(valid).success).toBe(true);
  for (const parentId of ["missing", "org-yayasan", "org-keamanan"]) {
    expect(
      directoryInput.safeParse({
        ...valid,
        leaders: valid.leaders.map((person) =>
          person.id === "org-yayasan" ? { ...person, parentId } : person,
        ),
      }).success,
    ).toBe(false);
  }
  expect(
    directoryInput.safeParse({
      ...valid,
      leaders: valid.leaders.map((person) =>
        person.id === "org-komite" ? { ...person, parentId: null } : person,
      ),
    }).success,
  ).toBe(false);
});
