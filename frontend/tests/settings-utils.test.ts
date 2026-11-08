import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/api/v1";

const { defaultSettings, getSchoolSettings } = await import(
  "../app/lib/cms/school"
);
const {
  fromLocalDateTimeInput,
  getSettings,
  saveSettings,
  toLocalDateTimeInput,
  validateSettings,
} = await import("../app/lib/api/settings");

import type { SchoolSettings } from "../app/lib/cms/types";

const valid: SchoolSettings = { ...defaultSettings };
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function mockFetch(status: number, body?: unknown) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: body === undefined ? {} : { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

test("pengaturan default lolos validasi dan memuat field kontrak v1.2.0", () => {
  assert.deepEqual(validateSettings(valid), {});
  assert.equal(valid.dataRetention, "indefinite");
  assert.deepEqual(valid.documentRequirements.requiredKinds, []);
  assert.equal(valid.registrationOpensAt, null);
  assert.equal(getSchoolSettings().dataRetention, "indefinite");
});

test("KIP/photo tidak boleh diwajibkan dan duplikat ditolak", () => {
  for (const kind of ["kip", "photo"]) {
    const errors = validateSettings({
      ...valid,
      documentRequirements: {
        requiredKinds: [kind as never],
        requireOneGraduationDocument: false,
      },
    });
    assert.ok(errors.requiredKinds, kind);
  }
  const duplicate = validateSettings({
    ...valid,
    documentRequirements: {
      requiredKinds: ["kk", "kk"],
      requireOneGraduationDocument: false,
    },
  });
  assert.ok(duplicate.requiredKinds);
  const ok = validateSettings({
    ...valid,
    documentRequirements: {
      requiredKinds: ["kk", "akta"],
      requireOneGraduationDocument: true,
    },
  });
  assert.deepEqual(ok, {});
});

test("tanggal tutup harus sesudah tanggal buka dan tidak mengubah toggle", () => {
  const reversed = validateSettings({
    ...valid,
    registrationOpensAt: "2026-11-10T00:00:00.000Z",
    registrationClosesAt: "2026-11-01T00:00:00.000Z",
  });
  assert.ok(reversed.registrationClosesAt);
  const onlyOne = validateSettings({
    ...valid,
    registrationClosesAt: "2026-11-01T00:00:00.000Z",
  });
  assert.deepEqual(onlyOne, {});
});

test("format tahun ajaran, email, dan panjang field divalidasi", () => {
  const errors = validateSettings({
    ...valid,
    academicYear: "2026",
    email: "bukan-email",
    ppdbEmail: "",
    schoolName: "A",
    phone: "123",
    address: "pendek",
  });
  for (const key of [
    "academicYear",
    "email",
    "ppdbEmail",
    "schoolName",
    "phone",
    "address",
  ] as const)
    assert.ok(errors[key], key);
});

test("konversi datetime-local dua arah dan nilai kosong menjadi null", () => {
  assert.equal(fromLocalDateTimeInput(""), null);
  assert.equal(toLocalDateTimeInput(null), "");
  const iso = fromLocalDateTimeInput("2026-11-01T08:30");
  assert.ok(iso);
  assert.equal(toLocalDateTimeInput(iso), "2026-11-01T08:30");
});

test("saveSettings mengirim PUT dengan seluruh SchoolSettings", async () => {
  const calls = mockFetch(200, valid);
  const saved = await saveSettings(valid);
  assert.equal(calls[0].url, "http://api.test/api/v1/settings");
  assert.equal(calls[0].init.method, "PUT");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), valid);
  assert.deepEqual(saved, valid);
});

test("getSettings menolak respons tanpa field kontrak, bukan memakai default", async () => {
  mockFetch(200, { schoolName: "SMP Contoh", registrationOpen: true });
  await assert.rejects(() => getSettings(), /tidak sesuai kontrak/);
});

test("kegagalan server diteruskan sebagai error dengan pesan server", async () => {
  mockFetch(403, { message: "Hanya super admin." });
  await assert.rejects(() => saveSettings(valid), /Hanya super admin/);
  mockFetch(500, { message: "Gagal." });
  await assert.rejects(() => getSettings(), /Gagal/);
});
