import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 12000 },
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "off",
  },
});
