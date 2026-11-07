import { spawn } from "node:child_process";
import { resolveCli } from "./resolve-cli.mjs";

// Set tool environment without shell-specific syntax so npm scripts work on Windows too.
process.env.WRANGLER_LOG_PATH ??= ".wrangler/wrangler.log";
process.env.WRANGLER_SEND_METRICS ??= "false";
process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

const [tool, ...args] = process.argv.slice(2);
const entrypoint = resolveCli(tool);

const child = spawn(process.execPath, [entrypoint, ...args], {
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
});
