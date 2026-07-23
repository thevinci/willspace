import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

// Load .env files if they exist
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    loadEnvFile(file);
  }
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error(
    "Usage: node scripts/import-linkedin.mjs <path-to-profile.json>",
  );
  process.exit(1);
}

console.log(`Importing LinkedIn profile from: ${jsonPath}`);

// Delegate to the existing TypeScript script
const child = spawn(
  "npx",
  ["tsx", "scripts/linkedin/save-to-spacetime.ts", jsonPath],
  {
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
