import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";

const port = 4300 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    [
      "scripts/run-cli.mjs",
      "wrangler",
      "dev",
      "--config",
      "dist/server/wrangler.json",
      "--port",
      String(port),
      "--ip",
      "127.0.0.1",
    ],
    { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });

  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null)
      throw new Error(`Server test berhenti:\n${serverOutput}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server masih dalam proses startup.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Server test tidak siap:\n${serverOutput}`);
});

after(() => {
  server?.kill("SIGTERM");
});

async function render(path = "/") {
  return fetch(`${baseUrl}${path}`, { headers: { accept: "text/html" } });
}

test("renders the finished public homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /SMP Nurul Huda/);
  assert.match(html, /Membentuk generasi/);
  assert.match(html, /Kabar dari Nurul Huda/);
  assert.match(html, /Login Admin/);
  assert.match(html, /site-navigation-shell/);
  assert.match(html, /og\.jpg/);
  assert.doesNotMatch(html, /SkeletonPreview|Your site is taking shape/);
});

test("renders public modules and a seeded article", async () => {
  for (const [path, marker] of [
    ["/blog", "Cerita Nurul Huda"],
    ["/struktur", "Struktur organisasi"],
    ["/prestasi", "Ide kecil, perubahan besar"],
    ["/pendaftaran", "Formulir PPDB"],
    ["/kontak", "Kirim pesan"],
    ["/blog/festival-inovasi-sains-2026", "Festival Inovasi Sains 2026"],
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(marker), path);
  }
});

test("PPDB and directory expose their new navigation and demo boundaries", async () => {
  const ppdb = await (await render("/pendaftaran")).text();
  assert.match(ppdb, /Langkah 1 dari 4/);
  assert.match(ppdb, /Ekstrakurikuler yang diminati/);
  assert.match(ppdb, /data dan berkas dummy/);
  const directory = await (await render("/struktur")).text();
  assert.match(directory, /role="tablist"/);
  assert.match(directory, /Daftar Guru/);
  const prestasi = await (await render("/prestasi")).text();
  assert.match(prestasi, /ilustrasi/i);
});

test("missing article returns an HTTP 404", async () => {
  assert.equal((await render("/blog/artikel-tidak-ada-untuk-pengujian")).status, 404);
});

test("keeps the announcement outside the sticky navigation", async () => {
  for (const path of ["/", "/tentang", "/struktur", "/pendaftaran"]) {
    const response = await render(path);
    const html = await response.text();
    assert.match(
      html,
      /class="notice-bar"[\s\S]*?<\/div>\s*<div class="site-navigation-shell[^"]*">\s*<header class="site-header"/,
      path,
    );
  }
});

test("scroll-state styles cannot change navigation geometry", async () => {
  for (const file of ["base.css", "accessibility.css"]) {
    const css = await readFile(
      new URL(`../app/styles/${file}`, import.meta.url),
      "utf8",
    );
    const rules = [...css.matchAll(/([^{}]*\.is-scrolled[^{}]*)\{([^{}]*)\}/g)];
    for (const [, selector, declarations] of rules) {
      // Guard against reintroducing the scroll-anchoring feedback loop.
      for (const declaration of declarations.split(";")) {
        const property = declaration.split(":")[0].trim();
        if (!property) continue;
        assert.ok(
          [
            "box-shadow",
            "background",
            "background-color",
            "border-bottom-color",
          ].includes(property),
          `${file}: ${selector.trim()} changes layout or an unreviewed property: ${property}`,
        );
      }
    }
  }
});

test("renders the safe local admin entry point", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const marker of [
    "Portal administrasi sekolah",
    "Selamat datang kembali",
    "Mode simulasi lokal",
    "Masuk ke mode demo",
  ]) {
    assert.match(html, new RegExp(marker));
  }
  assert.doesNotMatch(html, /nurulhuda123/);
  assert.doesNotMatch(html, /Selamat pagi, Rania/);
  assert.match(html, /noindex, nofollow/);
});

test("publishes SEO support routes", async () => {
  const [sitemap, robots] = await Promise.all([
    render("/sitemap.xml"),
    render("/robots.txt"),
  ]);
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /festival-inovasi-sains-2026/);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/admin/);
});

test("sends baseline security headers", async () => {
  const response = await render("/");
  assert.match(
    response.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/,
  );
  assert.match(
    response.headers.get("content-security-policy") ?? "",
    /frame-src 'self' blob:/,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
});
