import { spawn } from "node:child_process";

if (process.env.POSTGRES_PASSWORD) {
  const url = new URL("postgres://postgres:5432");
  url.username = process.env.POSTGRES_USER || "nurul_huda";
  url.password = process.env.POSTGRES_PASSWORD;
  url.pathname = "/" + (process.env.POSTGRES_DB || "nurul_huda");
  process.env.DATABASE_URL = url.href;
}
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("Perintah container belum ditentukan.");
const child = spawn(command, args, { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", () => { console.error("Perintah container gagal dijalankan."); process.exitCode = 1; });
child.on("exit", (code, signal) => { process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1); });
