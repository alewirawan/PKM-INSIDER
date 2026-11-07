import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

export function resolveCli(tool, from = import.meta.url) {
  if (!["vinext", "wrangler"].includes(tool))
    throw new Error("Tool harus vinext atau wrangler.");

  const require = createRequire(from);
  for (const directory of require.resolve.paths(tool) ?? []) {
    const packageDirectory = join(directory, tool);
    const manifestPath = join(packageDirectory, "package.json");
    if (!existsSync(manifestPath)) continue;

    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      throw new Error(`Metadata ${tool} tidak valid. Jalankan npm ci dari root project.`);
    }
    const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.[tool];
    if (typeof bin !== "string" || !bin)
      throw new Error(`CLI ${tool} tidak tercantum dalam paket. Jalankan npm ci dari root project.`);

    const entrypoint = resolve(packageDirectory, bin);
    if (!existsSync(entrypoint) || !statSync(entrypoint).isFile())
      throw new Error(`File CLI ${tool} belum terpasang lengkap. Jalankan npm ci dari root project.`);
    return entrypoint;
  }
  throw new Error(`Paket ${tool} belum terpasang. Jalankan npm ci dari root project.`);
}
