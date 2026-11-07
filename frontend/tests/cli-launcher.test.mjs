import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, test } from "node:test";
import { resolveCli } from "../scripts/resolve-cli.mjs";

const fixtures = [];
after(async () => { await Promise.all(fixtures.map((folder) => rm(folder, { recursive: true, force: true }))); });

async function fixture({ nested = false, bin = "dist/cli.js", file = true } = {}) {
  const root = await mkdtemp(join(tmpdir(), "school CLI spaces "));
  fixtures.push(root);
  const scripts = join(root, "frontend", "scripts");
  const packageDirectory = join(root, ...(nested ? ["frontend"] : []), "node_modules", "vinext");
  await mkdir(scripts, { recursive: true });
  await mkdir(join(packageDirectory, "dist"), { recursive: true });
  await writeFile(join(packageDirectory, "package.json"), JSON.stringify({ name: "vinext", type: "module", bin: { vinext: bin } }));
  if (file) await writeFile(join(packageDirectory, "dist/cli.js"), "console.log(JSON.stringify(process.argv.slice(2)));\n");
  const caller = join(scripts, "probe.mjs");
  await writeFile(caller, "console.log(import.meta.resolve('vinext'));\n");
  return { caller, entrypoint: join(packageDirectory, "dist/cli.js") };
}

test("launches a hoisted CLI even when the package has no library entry point", async () => {
  const { caller, entrypoint } = await fixture();
  const legacy = spawnSync(process.execPath, [caller], { encoding: "utf8" });
  assert.notEqual(legacy.status, 0);
  assert.match(legacy.stderr, /ERR_MODULE_NOT_FOUND/);
  const resolved = resolveCli("vinext", pathToFileURL(caller));
  assert.equal(resolved, entrypoint);
  const launched = spawnSync(process.execPath, [resolved, "dev", "argument with spaces"], { encoding: "utf8" });
  assert.equal(launched.status, 0, launched.stderr);
  assert.deepEqual(JSON.parse(launched.stdout), ["dev", "argument with spaces"]);
});

test("finds a dependency installed inside the frontend workspace", async () => {
  const { caller, entrypoint } = await fixture({ nested: true });
  assert.equal(resolveCli("vinext", pathToFileURL(caller)), entrypoint);
});

test("reports incomplete installation instead of guessing an index.js path", async () => {
  const { caller } = await fixture({ file: false });
  assert.throws(() => resolveCli("vinext", pathToFileURL(caller)), /belum terpasang lengkap.*npm ci/);
});

test("resolves both installed tool binaries", () => {
  for (const tool of ["vinext", "wrangler"]) {
    assert.ok(resolveCli(tool).endsWith(".js"));
  }
});
