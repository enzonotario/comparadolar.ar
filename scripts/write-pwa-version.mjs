import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

function gitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const commit =
  process.env.CF_PAGES_COMMIT_SHA?.slice(0, 12) ||
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.GITHUB_SHA?.slice(0, 12) ||
  process.env.COMMIT_SHA?.slice(0, 12) ||
  gitCommit() ||
  "local";
const builtAt = new Date().toISOString();
const version = `${commit}-${builtAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`;

writeFileSync(
  "public/app-version.json",
  `${JSON.stringify({ version, commit, builtAt }, null, 2)}\n`,
);

console.log(`Wrote PWA app version ${version}`);
