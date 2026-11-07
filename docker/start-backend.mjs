import { spawn } from "node:child_process";

let child;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child?.kill(signal));

function run(args) {
  return new Promise((resolve, reject) => {
    child = spawn("npm", args, { stdio: "inherit", env: process.env });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error("Perintah backend gagal.")));
  });
}

try {
  await run(["run", "db:migrate", "--workspace=@nurul-huda/backend"]);
  await run(["run", "db:verify", "--workspace=@nurul-huda/backend"]);
  await run(["run", "dev:backend"]);
} catch {
  console.error("Backend berhenti. Periksa log migration atau proses API di atas.");
  process.exitCode = 1;
}
