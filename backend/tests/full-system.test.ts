import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createDatabase } from "../src/db/client.js";
import { admins } from "../src/db/schema/auth.js";
import { migrateSchoolDatabase } from "../src/db/migrate.js";
import { testConfig } from "./content-fixture.js";

const url =
  process.env.FULL_SYSTEM_DATABASE_URL ??
  (process.env.RUN_FULL_SYSTEM_TESTS === "1"
    ? process.env.DATABASE_URL
    : undefined);
describe.skipIf(!url)(
  "school workflows with PostgreSQL and private storage",
  () => {
    let app: Awaited<ReturnType<typeof buildApp>>,
      database: ReturnType<typeof createDatabase>,
      directory: string;
    const origin = "http://localhost:3000",
      suffix = randomUUID(),
      password = "Development-test-password-2026";
    let adminCookie = "",
      editorCookie = "",
      ppdbCookie = "",
      number = "",
      applicantCookie = "",
      slot = "";
    const biodata = {
      studentName: "Siswa Pengujian",
      nisn: "1234567890",
      originSchool: "SD Pengujian",
      birthPlace: "Bandung",
      birthDate: "2013-01-01",
      gender: "Laki-laki",
      address: "Alamat fiktif untuk tes",
      parentName: "Wali Pengujian",
      parentOccupation: "Wiraswasta",
      phone: "081234567890",
      email: "wali@example.test",
      extracurriculars: [],
    };
    const headers = () => ({ origin, cookie: adminCookie });
    async function multipart(
      data: unknown,
      kind = "kk",
      content = "%PDF-1.4\nfixture",
    ) {
      const boundary = `test-${randomUUID()}`;
      const body = `--${boundary}\r\nContent-Disposition: form-data; name="data"\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}\r\nContent-Disposition: form-data; name="${kind}"; filename="berkas.pdf"\r\nContent-Type: application/pdf\r\n\r\n${content}\r\n--${boundary}--\r\n`;
      return { body, contentType: `multipart/form-data; boundary=${boundary}` };
    }
    beforeAll(async () => {
      const parsed = new URL(url!);
      if (
        !["127.0.0.1", "localhost", "postgres"].includes(parsed.hostname) ||
        !/(?:_test|_ci)$/.test(parsed.pathname)
      )
        throw new Error("Gunakan database test lokal terpisah.");
      database = createDatabase(url!);
      await migrateSchoolDatabase(database);
      directory = await mkdtemp(path.join(tmpdir(), "school-test-"));
      app = await buildApp({
        ...testConfig,
        DATABASE_URL: url!,
        UPLOAD_DIR: directory,
      });
      for (const role of ["super_admin", "editor", "admin_ppdb"] as const) {
        const email = `${role}-${suffix}@example.test`;
        await database.db.insert(admins).values({
          email,
          displayName: "Admin Uji",
          role,
          passwordHash: await hash(password),
        });
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          headers: { origin },
          payload: { email, password },
        });
        expect(res.statusCode).toBe(204);
        const cookie = String(res.headers["set-cookie"]).split(";")[0]!;
        if (role === "super_admin") adminCookie = cookie;
        else if (role === "editor") editorCookie = cookie;
        else ppdbCookie = cookie;
      }
    }, 30000);
    afterAll(async () => {
      await app?.close();
      await database?.client.end();
      if (directory) await rm(directory, { recursive: true, force: true });
    });
    it("persists settings and protects writes by role and origin", async () => {
      const settings = (await app.inject("/api/v1/settings")).json();
      expect(
        (
          await app.inject({
            method: "PUT",
            url: "/api/v1/settings",
            headers: { origin, cookie: editorCookie },
            payload: settings,
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: "PUT",
            url: "/api/v1/settings",
            headers: { cookie: adminCookie },
            payload: settings,
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: "PUT",
            url: "/api/v1/settings",
            headers: headers(),
            payload: {
              ...settings,
              documentRequirements: {
                requiredKinds: ["kip"],
                requireOneGraduationDocument: false,
              },
            },
          })
        ).statusCode,
      ).toBe(422);
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/settings",
        headers: headers(),
        payload: {
          ...settings,
          registrationOpen: true,
          documentRequirements: {
            requiredKinds: ["kk"],
            requireOneGraduationDocument: false,
          },
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().registrationOpen).toBe(true);
    });
    it("round trips variable directory structure and unpublished achievements", async () => {
      const directory = {
        leaders: [],
        teachers: [
          {
            id: `teacher-${suffix}`,
            name: "Guru Contoh",
            initials: "GC",
            subject: "IPA",
            cluster: "Sains",
            years: 5,
            note: "Catatan guru",
            tone: "sage",
            portraitIndex: 0,
          },
        ],
      };
      const save = await app.inject({
        method: "PUT",
        url: "/api/v1/directory",
        headers: headers(),
        payload: directory,
      });
      expect(save.statusCode).toBe(200);
      expect((await app.inject("/api/v1/directory")).json()).toEqual(directory);
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/achievements",
        headers: headers(),
        payload: {
          title: "Prestasi Uji",
          award: "Juara 1",
          level: "Kota",
          year: "2026",
          category: "Akademik",
          description: "Contoh prestasi sekolah",
          image: "/images/science.jpg",
          published: false,
        },
      });
      expect(res.statusCode).toBe(201);
      const id = res.json().id;
      expect(
        (await app.inject("/api/v1/achievements"))
          .json()
          .some((a: { id: string }) => a.id === id),
      ).toBe(false);
      expect(
        (
          await app.inject({
            method: "PATCH",
            url: `/api/v1/achievements/${id}`,
            headers: headers(),
            payload: { published: true },
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await app.inject("/api/v1/achievements"))
          .json()
          .some((a: { id: string }) => a.id === id),
      ).toBe(true);
    });
    it("accepts contact and newsletter consent with private admin listing", async () => {
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/messages",
            headers: { origin },
            payload: {
              name: "Orang Tua",
              email: "wali@example.test",
              topic: "PPDB",
              message: "Pertanyaan pendaftaran siswa.",
            },
          })
        ).statusCode,
      ).toBe(201);
      expect((await app.inject("/api/v1/messages")).statusCode).toBe(401);
      expect(
        (await app.inject({ url: "/api/v1/messages", headers: headers() }))
          .statusCode,
      ).toBe(200);
      for (let i = 0; i < 2; i++)
        expect(
          (
            await app.inject({
              method: "POST",
              url: "/api/v1/newsletter-subscriptions",
              headers: { origin },
              payload: { email: "newsletter@example.test", consent: true },
            })
          ).statusCode,
        ).toBe(204);
    });
    it("rejects missing/forged documents and saves an idempotent private registration", async () => {
      const data = { ...biodata, password, consent: true };
      const invalid = await multipart(data, "kk", "not-a-pdf");
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applications",
            headers: {
              origin,
              "content-type": invalid.contentType,
              "idempotency-key": randomUUID(),
            },
            payload: invalid.body,
          })
        ).statusCode,
      ).toBe(422);
      const valid = await multipart(data),
        key = randomUUID();
      for (let i = 0; i < 2; i++) {
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/applications",
          headers: {
            origin,
            "content-type": valid.contentType,
            "idempotency-key": key,
          },
          payload: valid.body,
        });
        expect(res.statusCode).toBe(201);
        if (number) expect(res.json().id).toBe(number);
        number = res.json().id;
      }
      const changed = await multipart({ ...data, studentName: "Nama berbeda" });
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applications",
            headers: {
              origin,
              "content-type": changed.contentType,
              "idempotency-key": key,
            },
            payload: changed.body,
          })
        ).statusCode,
      ).toBe(409);
      expect(
        (await app.inject(`/api/v1/applications/${number}`)).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            url: `/api/v1/applications/${number}`,
            headers: { cookie: editorCookie },
          })
        ).statusCode,
      ).toBe(403);
      const record = (
        await app.inject({
          url: `/api/v1/applications/${number}`,
          headers: headers(),
        })
      ).json();
      slot = record.documents.find((d: { kind: string }) => d.kind === "kk").id;
      expect(record.documents.length).toBe(6);
      expect(JSON.stringify(record)).not.toMatch(/storageKey|passwordHash/);
      expect(
        (
          await app.inject({
            method: "PATCH",
            url: `/api/v1/applications/${number}`,
            headers: headers(),
            payload: { status: "Diterima" },
          })
        ).statusCode,
      ).toBe(409);
      expect(
        (
          await app.inject(
            `/api/v1/applications/${number}/documents/${slot}/download`,
          )
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            url: `/api/v1/applications/${number}/documents/${slot}/download`,
            headers: headers(),
          })
        ).body,
      ).toContain("%PDF");
    });
    it("supports applicant corrections, verification and admission history", async () => {
      const login = await app.inject({
        method: "POST",
        url: "/api/v1/applicant/login",
        headers: { origin },
        payload: { number, password },
      });
      expect(login.statusCode).toBe(204);
      applicantCookie = String(login.headers["set-cookie"]).split(";")[0]!;
      expect(
        (
          await app.inject({
            url: "/api/v1/applicant/application",
            headers: { cookie: applicantCookie },
          })
        ).json().id,
      ).toBe(number);
      expect(
        (
          await app.inject({
            method: "PATCH",
            url: `/api/v1/applications/${number}/documents/${slot}`,
            headers: headers(),
            payload: {
              status: "Perlu perbaikan",
              reviewNote: "Unggah dokumen yang terbaca.",
            },
          })
        ).statusCode,
      ).toBe(200);
      const boundary = `test-${randomUUID()}`,
        payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="revisi.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nrevised\r\n--${boundary}--\r\n`;
      const replace = await app.inject({
        method: "PUT",
        url: "/api/v1/applicant/documents/kk",
        headers: {
          origin,
          cookie: applicantCookie,
          "content-type": `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });
      expect(replace.statusCode).toBe(200);
      expect(replace.json().status).toBe("Menunggu pemeriksaan");
      expect(
        (
          await app.inject({
            method: "PATCH",
            url: `/api/v1/applications/${number}/documents/${slot}`,
            headers: headers(),
            payload: { status: "Terverifikasi", reviewNote: "Sudah sesuai." },
          })
        ).statusCode,
      ).toBe(200);
      const accepted = await app.inject({
        method: "PATCH",
        url: `/api/v1/applications/${number}`,
        headers: headers(),
        payload: { status: "Diterima" },
      });
      expect(accepted.statusCode).toBe(200);
      expect(accepted.json().parentOccupation).toBe("Wiraswasta");
      expect(
        (
          await app.inject({
            method: "PUT",
            url: "/api/v1/applicant/documents/kk",
            headers: {
              origin,
              cookie: applicantCookie,
              "content-type": `multipart/form-data; boundary=${boundary}`,
            },
            payload,
          })
        ).statusCode,
      ).toBe(409);
    });
    it("supports offline receipt, one-use activation and rejects foreign file access", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/applications/offline",
        headers: {
          origin,
          cookie: ppdbCookie,
          "idempotency-key": randomUUID(),
        },
        payload: {
          ...biodata,
          nisn: "1111111111",
          receivedDocumentKinds: ["kk"],
        },
      });
      expect(res.statusCode).toBe(201);
      const offlineNumber = res.json().id;
      const offline = (
        await app.inject({
          url: `/api/v1/applications/${offlineNumber}`,
          headers: headers(),
        })
      ).json();
      const physicalSlot = offline.documents.find(
        (d: { kind: string }) => d.kind === "akta",
      ).id;
      const physical = await app.inject({
        method: "PATCH",
        url: `/api/v1/applications/${offlineNumber}/documents/${physicalSlot}`,
        headers: headers(),
        payload: {
          status: "Terverifikasi",
          reviewNote: "Fisik diperiksa.",
          receivedPhysically: true,
        },
      });
      expect(physical.statusCode).toBe(200);
      expect(physical.json().receivedPhysically).toBe(true);
      const first = (
        await app.inject({
          url: "/api/v1/applications?limit=1",
          headers: headers(),
        })
      ).json();
      expect(first.items).toHaveLength(1);
      expect(first.nextCursor).toBeTruthy();
      const second = (
        await app.inject({
          url: `/api/v1/applications?limit=1&cursor=${first.nextCursor}`,
          headers: headers(),
        })
      ).json();
      expect(second.items[0].id).not.toBe(first.items[0].id);
      const boundary = `admin-${randomUUID()}`;
      const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="offline.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\noffline fixture\r\n--${boundary}--\r\n`;
      const uploaded = await app.inject({
        method: "PUT",
        url: `/api/v1/applications/${offlineNumber}/documents/by-kind/kk`,
        headers: {
          ...headers(),
          "content-type": `multipart/form-data; boundary=${boundary}`,
        },
        payload: body,
      });
      expect(uploaded.statusCode).toBe(200);
      expect(uploaded.json().hasFile).toBe(true);
      const access = await app.inject({
        method: "POST",
        url: `/api/v1/applications/${offlineNumber}/access`,
        headers: headers(),
      });
      expect(access.statusCode).toBe(200);
      const token = access.json().token;
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applicant/activate",
            headers: { origin },
            payload: { token, password },
          })
        ).statusCode,
      ).toBe(204);
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applicant/activate",
            headers: { origin },
            payload: { token, password },
          })
        ).statusCode,
      ).toBe(401);
      const login = await app.inject({
        method: "POST",
        url: "/api/v1/applicant/login",
        headers: { origin },
        payload: { number: offlineNumber, password },
      });
      const otherCookie = String(login.headers["set-cookie"]).split(";")[0]!;
      expect(
        (
          await app.inject({
            url: `/api/v1/applicant/documents/${slot}/download`,
            headers: { cookie: otherCookie },
          })
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await app.inject({
            url: "/api/v1/dashboard/summary",
            headers: { cookie: editorCookie },
          })
        ).statusCode,
      ).toBe(403);
      const summary = await app.inject({
        url: "/api/v1/dashboard/summary",
        headers: headers(),
      });
      expect(summary.statusCode).toBe(200);
      expect(summary.json().totalApplications).toBeGreaterThanOrEqual(2);
      const settings = (await app.inject("/api/v1/settings")).json();
      await app.inject({
        method: "PUT",
        url: "/api/v1/settings",
        headers: headers(),
        payload: { ...settings, registrationOpen: false },
      });
      const upload = await multipart({ ...biodata, password, consent: true });
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applications",
            headers: {
              origin,
              "content-type": upload.contentType,
              "idempotency-key": randomUUID(),
            },
            payload: upload.body,
          })
        ).statusCode,
      ).toBe(409);
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/applicant/logout",
            headers: { origin, cookie: applicantCookie },
          })
        ).statusCode,
      ).toBe(204);
      expect(
        (
          await app.inject({
            url: "/api/v1/applicant/application",
            headers: { cookie: applicantCookie },
          })
        ).statusCode,
      ).toBe(401);
    });
  },
);
