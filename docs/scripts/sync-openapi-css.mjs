import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = require.resolve("vitepress-openapi/dist/style.css");
const destDir = join(root, "public");
const dest = join(destDir, "vitepress-openapi.css");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied vitepress-openapi CSS → ${dest}`);
