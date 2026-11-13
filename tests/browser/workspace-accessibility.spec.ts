import { test, expect } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`workspace and registration controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/struktur");
    await expect(page.locator(".workspace-person")).toHaveCount(13);
    const plane = page.locator(".organization-plane");
    await page.getByRole("button", { name: "2D", exact: true }).click();
    await expect(plane).toBeVisible();
    await expect(page.locator('[data-person-id="org-kepala"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `artifacts/2026-11-13-structure-final-${width}.png`,
        fullPage: true,
      });
    }
    await page.getByLabel("Temukan peran").selectOption("org-kepala");
    await expect(page.locator(".workspace-details")).toContainText(
      "Fajar Anwar",
    );
    await expect(page.locator('[data-person-id="org-kepala"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const camera = page
      .locator(".workspace-viewport > div > div > div")
      .first();
    const original = await camera.getAttribute("style");
    await page.getByRole("button", { name: "3D", exact: true }).click();
    await expect(camera).not.toHaveAttribute("style", original!);
    if (width === 1440) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: "artifacts/2026-11-13-structure-3d-final.png",
        fullPage: true,
      });
    }
    await page.getByRole("button", { name: "Perbesar bagan" }).click();
    await page.getByRole("button", { name: "Lihat bagian kanan" }).click();
    await page.getByRole("button", { name: "Tampilkan seluruh bagan" }).click();
    await page.getByRole("button", { name: "Daftar", exact: true }).click();
    await expect(page.locator(".workspace-list li")).toHaveCount(13);
    await page
      .locator(".workspace-list button")
      .filter({ hasText: "Hasan, S.Pd" })
      .click();
    await expect(page.locator(".workspace-details")).toContainText(
      "Waka Sarpras",
    );
    await page.getByRole("button", { name: "2D", exact: true }).click();
    await expect(page.locator(".workspace-viewport")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page
      .locator(".organization-workspace")
      .screenshot({ path: `artifacts/2026-11-13-workspace-${width}.png` });
    await page.getByRole("tab", { name: "Daftar Guru" }).click();
    await page.getByLabel("Cari nama atau mata pelajaran").fill("PJOK");
    await expect(page.locator(".teacher-card")).toHaveCount(1);
    await expect(page.locator(".teacher-card")).toContainText("Rehan");
    await page.getByLabel("Cari nama atau mata pelajaran").fill("Tata Usaha");
    await expect(page.locator(".teacher-card")).toHaveCount(2);
    await page.goto("/pendaftaran");
    await expect(
      page.locator(".extracurricular-options input").first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "Isi formulir", exact: true }).click();
    const checkbox = page.locator(".extracurricular-options input").first();
    const size = await checkbox.boundingBox();
    expect(size?.width).toBe(18);
    expect(size?.height).toBe(18);
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
    await expect(page.locator(".extracurricular-count")).toHaveText(
      "1 kegiatan dipilih",
    );
    await page.locator(".extracurricular-options input").nth(1).check();
    await expect(page.locator(".extracurricular-count")).toHaveText(
      "2 kegiatan dipilih",
    );
    await expect(
      page.locator(".extracurricular-options label").first(),
    ).toHaveClass("is-selected");
    await page
      .getByText("Persyaratan berkas", { exact: false })
      .first()
      .click();
    await expect(page.locator(".admission-requirements ul")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page
      .locator(".registration-form")
      .screenshot({ path: `artifacts/2026-11-13-registration-${width}.png` });
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `artifacts/2026-11-13-ppdb-final-${width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("mobile navigation contains focus, closes with Escape and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Menu", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Menu navigasi" });
  await expect(
    dialog.getByRole("button", { name: "Tutup menu" }),
  ).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  const links = dialog.locator("a");
  await links.last().focus();
  await page.keyboard.press("Tab");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await page.getByRole("link", { name: "Lewati navigasi" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});
