import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const directory = require.resolve
  .paths("drizzle-kit")
  .find((p) => existsSync(join(p, "drizzle-kit/package.json")));
if (!directory)
  throw new Error(
    "drizzle-kit belum terpasang. Jalankan npm ci dari root project.",
  );
const root = join(directory, "drizzle-kit"),
  manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const bin =
  typeof manifest.bin === "string" ? manifest.bin : manifest.bin["drizzle-kit"];
const child = spawn(
  process.execPath,
  [resolve(root, bin), ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("CLI database gagal dijalankan.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
