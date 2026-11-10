import { test, expect } from "@playwright/test";
const api = process.env.E2E_API_URL || "http://localhost:4000/api/v1";
const origin = process.env.E2E_BASE_URL || "http://localhost:3000";
const password = "Browser-fixture-password-2026";
test.describe.configure({ mode: "serial" });
test.beforeAll(async ({ request }) => {
  expect(process.env.RUN_BROWSER_TESTS).toBe("1");
  const login = await request.post(`${api}/auth/login`, {
    headers: { origin },
    data: { email: "browser-test@example.test", password },
  });
  expect(login.status()).toBe(204);
  const settings = await (await request.get(`${api}/settings`)).json();
  expect(
    (
      await request.put(`${api}/settings`, {
        headers: { origin },
        data: {
          ...settings,
          registrationOpen: true,
          documentRequirements: {
            requiredKinds: ["kk"],
            requireOneGraduationDocument: false,
          },
        },
      })
    ).ok(),
  ).toBeTruthy();
});

test("online admission, applicant portal, private correction and admin acceptance", async ({
  page,
  browser,
}) => {
  const suffix = Date.now().toString().slice(-7),
    name = `Siswa Browser ${suffix}`;
  await page.goto("/pendaftaran");
  await page.getByLabel("Nama lengkap", { exact: true }).fill(name);
  await page.getByLabel("NISN", { exact: true }).fill(`123${suffix}`);
  await page.getByLabel("Tempat lahir", { exact: true }).fill("Bandung");
  await page.getByLabel("Tanggal lahir", { exact: true }).fill("2013-01-01");
  await page.getByLabel("Asal sekolah", { exact: true }).fill("SD Pengujian");
  await page
    .getByLabel("Alamat domisili")
    .fill("Alamat fiktif untuk pengujian browser");
  await page.getByRole("button", { name: "Lanjut:" }).click();
  await page
    .getByLabel("Nama orang tua/wali", { exact: true })
    .fill("Wali Pengujian");
  await page.getByLabel("Nomor WhatsApp").fill("081234567890");
  await page
    .getByLabel("Email", { exact: true })
    .fill("wali-browser@example.test");
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByLabel("Ulangi password").fill(password);
  await page.getByRole("button", { name: "Lanjut:" }).click();
  await page
    .locator('input[type="file"]')
    .nth(2)
    .setInputFiles({
      name: "kk.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nBrowser fixture"),
    });
  await page.getByRole("button", { name: "Lanjut:" }).click();
  await page.getByRole("checkbox", { name: /Saya menyatakan/ }).check();
  await page
    .getByRole("button", { name: "Kirim pendaftaran", exact: true })
    .click();
  await expect(page.getByText("Simpan nomor pendaftaranmu.")).toBeVisible();
  const number = (
    await page.locator(".form-success strong").innerText()
  ).trim();
  await page
    .getByRole("link", { name: "Buka portal pendaftar", exact: true })
    .click();
  await page.getByLabel("Nomor pendaftaran").fill(number);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  const adminContext = await browser.newContext({ baseURL: origin });
  const admin = await adminContext.newPage();
  await admin.goto("/admin");
  await admin.getByLabel("Email admin").fill("browser-test@example.test");
  await admin.locator('input[autocomplete="current-password"]').fill(password);
  await admin.getByRole("button", { name: "Masuk ke dashboard" }).click();
  await expect(
    admin.getByText("Selamat datang, Admin Pengujian"),
  ).toBeVisible();
  await admin
    .getByRole("button", { name: "Data siswa", exact: true })
    .first()
    .click();
  await admin.getByLabel("Cari nama, NISN, atau nomor").fill(number);
  await admin.getByRole("button", { name: new RegExp(name) }).click();
  await admin.getByRole("button", { name: "berkas", exact: true }).click();
  const kk = admin.locator(".live-document-card").filter({
    has: admin.getByRole("heading", { name: "Kartu Keluarga", exact: true }),
  });
  await kk.getByLabel("Status pemeriksaan").selectOption("Perlu perbaikan");
  await kk
    .getByLabel("Catatan untuk pendaftar")
    .fill("Unggah ulang seluruh halaman.");
  await kk.getByRole("button", { name: "Simpan pemeriksaan" }).click();
  await expect(kk.locator("header")).toContainText("Perlu perbaikan");
  await page.reload();
  await expect(page.getByText("Unggah ulang seluruh halaman.")).toBeVisible();
  const applicantKk = page.locator(".upload-card").filter({
    has: page.getByRole("heading", { name: "Kartu Keluarga", exact: true }),
  });
  await applicantKk.locator('input[type="file"]').setInputFiles({
    name: "kk-revisi.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nRevision fixture"),
  });
  await expect(applicantKk).toContainText("kk-revisi.pdf");
  await admin.getByRole("button", { name: "Tutup", exact: true }).click();
  await admin.getByRole("button", { name: new RegExp(name) }).click();
  await admin.getByRole("button", { name: "berkas", exact: true }).click();
  await kk.getByLabel("Status pemeriksaan").selectOption("Terverifikasi");
  await kk.getByRole("button", { name: "Simpan pemeriksaan" }).click();
  await expect(kk.locator("header")).toContainText("Terverifikasi");
  await admin.getByRole("button", { name: "status", exact: true }).click();
  await admin.getByLabel("Status penerimaan").selectOption("Diterima");
  await admin
    .getByRole("button", { name: "Simpan status", exact: true })
    .click();
  await expect(admin.getByLabel("Status penerimaan")).toHaveValue("Diterima");
  await page.reload();
  await expect(page.locator(".portal-record-heading")).toContainText(
    "Diterima",
  );
  await adminContext.close();
});

test("public pages fit mobile and desktop and About differs from Home", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/tentang",
      "/struktur",
      "/program",
      "/prestasi",
      "/blog",
      "/kontak",
      "/pendaftaran",
      "/pendaftar",
      "/admin",
    ]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole("main")).toBeVisible();
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          { message: `Overflow ${route} ${width}` },
        )
        .toBeTruthy();
      if (route === "/tentang")
        await expect(
          page.getByText("Pendidikan dimulai dari kepedulian."),
        ).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test("admin saves offline registration, physical evidence and opens each module on mobile", async ({
  page,
}) => {
  await page.context().request.post(`${api}/auth/login`, {
    headers: { origin },
    data: { email: "browser-test@example.test", password },
  });
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Data siswa", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Pendaftaran offline" }).click();
  const dialog = page.getByRole("dialog");
  const name = `Siswa Offline ${Date.now()}`;
  for (const [label, value] of [
    ["Nama lengkap", name],
    ["NISN", "9876543210"],
    ["Tempat lahir", "Bandung"],
    ["Tanggal lahir", "2013-02-01"],
    ["Asal sekolah", "SD Contoh"],
    ["Alamat domisili", "Alamat fiktif pengujian offline"],
    ["Nama orang tua/wali", "Wali Offline"],
    ["Nomor WhatsApp", "081234567890"],
    ["Email", "wali-offline@example.test"],
  ])
    await dialog.getByLabel(label, { exact: true }).fill(value);
  await dialog
    .getByRole("checkbox", { name: "Kartu Keluarga", exact: true })
    .check();
  await dialog
    .getByRole("button", { name: "Simpan data", exact: true })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "berkas", exact: true }).click();
  const kk = page.locator(".live-document-card").filter({
    has: page.getByRole("heading", { name: "Kartu Keluarga", exact: true }),
  });
  await expect(kk.getByRole("checkbox")).toBeChecked();
  await kk.locator('input[type="file"]').setInputFiles({
    name: "kk-offline.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nOffline browser fixture"),
  });
  await expect(kk).toContainText("kk-offline.pdf");
  await page.getByRole("button", { name: "Tutup", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const label of [
    "Struktur & guru",
    "Prestasi sekolah",
    "Ekstrakurikuler",
    "Artikel & berita",
    "Agenda sekolah",
    "Pengaturan",
  ]) {
    await page.getByRole("button", { name: "Lainnya", exact: true }).click();
    await page
      .locator(".admin-mobile-more")
      .getByRole("button", { name: label })
      .click();
    await expect(page.locator(".admin-mobile-more")).toHaveCount(0);
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        { message: label },
      )
      .toBeTruthy();
  }
  await page
    .getByLabel("Email utama", { exact: true })
    .fill("sekolah-browser@example.test");
  await page
    .getByRole("textbox", { name: "Alamat", exact: true })
    .fill("Alamat fiktif sekolah untuk pengujian");
  const saved = page.waitForResponse(
    (r) => r.url() === `${api}/settings` && r.request().method() === "PUT",
  );
  await page
    .getByRole("button", { name: "Simpan pengaturan", exact: true })
    .click();
  expect((await saved).status()).toBe(200);
  await page.goto("/kontak");
  await expect(page.locator(".contact-list")).toContainText(
    "sekolah-browser@example.test",
  );
  await expect(page.locator(".contact-list")).toContainText(
    "Alamat fiktif sekolah untuk pengujian",
  );
  await page.screenshot({
    path: "test-results/admin-mobile-settings.png",
    fullPage: true,
  });
});
