import { test, expect } from "@playwright/test";

test("school content, local photographs and layouts on mobile and desktop", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/tentang",
      "/struktur",
      "/program",
      "/prestasi",
      "/blog",
      "/blog/semangat-kemerdekaan-17-agustus",
      "/kontak",
      "/pendaftaran",
      "/admin",
    ]) {
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.getByRole("main")).toBeVisible();
      if (route !== "/admin")
        await expect(
          page
            .locator("footer")
            .getByRole("link", { name: "smnurulhuda.cisoka@gmail.com" }),
        ).toBeVisible();
      if (route === "/")
        await expect(page.locator(".news-grid")).toContainText(
          "Merah Putih dan Kebersamaan",
        );
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          { message: `Overflow ${route} ${width}` },
        )
        .toBeTruthy();
      if (route === "/struktur") {
        await expect(page.locator(".workspace-person")).toHaveCount(13);
        await expect(
          page.locator('[data-person-id="org-yayasan"]'),
        ).toContainText("H. Abu Bakar Sidik");
        await expect(
          page.locator('[data-person-id="org-komite"]'),
        ).toContainText("Komite Sekolah");
        await page.screenshot({
          path: `artifacts/2026-11-13-organization-${width}.png`,
          fullPage: true,
        });
        await page.getByRole("tab", { name: "Daftar Guru" }).click();
        await expect(page.locator(".teacher-card")).toHaveCount(16);
        await page
          .getByPlaceholder("Cari nama atau mata pelajaran")
          .fill("Fajar");
        await expect(page.locator(".teacher-card")).toHaveCount(1);
        await page.getByPlaceholder("Cari nama atau mata pelajaran").clear();
        await page.getByRole("tab", { name: "Struktur Organisasi" }).click();
        await expect(page.locator("#directory-panel-0")).toBeVisible();
        await page.getByRole("tab", { name: "Daftar Guru" }).click();
      }
      if (route === "/tentang")
        await expect(
          page.getByText("Sebidang kebun. Sebuah harapan yang panjang."),
        ).toBeVisible();
      if (route === "/kontak") {
        await expect(page.locator(".contact-list")).toContainText(
          "smnurulhuda.cisoka@gmail.com",
        );
        await expect(page.locator(".school-map iframe")).toHaveAttribute(
          "src",
          /-6\.2632777778,106\.41875/,
        );
      }
      if (route.includes("semangat-kemerdekaan"))
        await expect(page.locator(".school-gallery img")).toHaveCount(3);
      const images = page.locator("main img");
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (node: HTMLImageElement) =>
                node.complete && node.naturalWidth > 0,
            ),
          )
          .toBeTruthy();
      }
      if (
        [
          "/",
          "/tentang",
          "/struktur",
          "/kontak",
          "/blog/semangat-kemerdekaan-17-agustus",
        ].includes(route)
      ) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `artifacts/2026-11-13-${route.replaceAll("/", "-") || "home"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("registration offers eight document types and brochure clubs", async ({
  page,
}) => {
  await page.goto("/pendaftaran");
  await expect(
    page.getByText("Nurul Huda Akustik", { exact: true }).first(),
  ).toBeVisible();
  for (const [label, value] of [
    ["Nama lengkap", "Calon Siswa Uji"],
    ["NISN", "1112223334"],
    ["Tempat lahir", "Tangerang"],
    ["Tanggal lahir", "2013-01-01"],
    ["Asal sekolah", "SD Pengujian"],
    ["Alamat domisili", "Alamat fiktif pengujian tampilan"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Lanjut:" }).click();
  await expect(page.locator(".wizard-step-title")).toBeFocused();
  await page
    .getByLabel("Nama orang tua/wali", { exact: true })
    .fill("Wali Pengujian");
  await page.getByLabel("Nomor WhatsApp").fill("0800000000");
  await page.getByLabel("Email", { exact: true }).fill("uji@example.test");
  await page
    .locator('input[type="password"]')
    .first()
    .fill("Form-fixture-2026");
  await page.getByLabel("Ulangi password").fill("Form-fixture-2026");
  await page.getByRole("button", { name: "Lanjut:" }).click();
  await expect(page.locator(".wizard-step-title")).toBeFocused();
  await expect(page.locator('input[type="file"]')).toHaveCount(8);
  await expect(
    page.locator(".upload-card").filter({ hasText: "Rapor" }),
  ).toContainText("Wajib");
  await expect(
    page.locator(".upload-card").filter({ hasText: "PIP" }),
  ).toContainText("Jika memiliki");
  await page.screenshot({
    path: "artifacts/2026-11-13-ppdb-documents.png",
    fullPage: true,
  });
});
