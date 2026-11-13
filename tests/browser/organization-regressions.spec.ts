import { test, expect } from "@playwright/test";

test("cards, modes and resize preserve the user's view; dragging does not select", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/struktur");
  const viewport = page.locator(".workspace-viewport");
  const card = page.locator('[data-person-id="org-kepala"]');
  await expect(card).toBeVisible();
  const initial = await viewport.getAttribute("data-zoom");
  await card.click();
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(viewport).toHaveAttribute("data-zoom", initial!);
  await page.getByRole("button", { name: "Perbesar bagan" }).click();
  const scale = await viewport.getAttribute("data-zoom");
  const center = await viewport.getAttribute("data-center");
  for (const mode of ["3D", "2D", "3D", "2D"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await expect(viewport).toHaveAttribute("data-zoom", scale!);
    await expect(viewport).toHaveAttribute("data-center", center!);
    await expect(card).toBeVisible();
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await expect(viewport).toHaveAttribute("data-zoom", scale!);
  await page.getByRole("button", { name: "Aktifkan geser kanvas" }).click();
  await viewport.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 80,
    box!.y + box!.height / 2 + 60,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(viewport).not.toHaveAttribute("data-center", center!);
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Selesai menggeser" }).click();
  await page.getByRole("button", { name: "Tampilkan seluruh bagan" }).click();
  const nodes = await page.locator(".workspace-person").all();
  const bounds = await viewport.boundingBox();
  for (const node of nodes) {
    const b = await node.boundingBox();
    expect(b!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
    expect(b!.x + b!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
    expect(b!.y).toBeGreaterThanOrEqual(bounds!.y - 1);
    expect(b!.y + b!.height).toBeLessThanOrEqual(
      bounds!.y + bounds!.height + 1,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/2026-11-13-organization-v2-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/2026-11-13-organization-v2-3d.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("mobile starts with a readable list and retains all relationships", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/struktur");
  await expect(
    page.getByRole("button", { name: "Daftar", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".workspace-list li")).toHaveCount(13);
  await expect(page.locator(".workspace-list")).toContainText(
    "Koordinasi dengan Kepala Sekolah",
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/2026-11-13-organization-v2-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".workspace-person")).toHaveCount(13);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
});

test("failed 3D module load preserves the complete text alternative", async ({
  page,
}) => {
  await page.route("**/*organization-scene*", (route) => route.abort());
  await page.goto("/struktur");
  await expect(page.locator(".workspace-list li")).toHaveCount(13);
  await expect(page.locator(".workspace-list")).toContainText(
    "Kanvas belum dapat dimuat",
  );
});
