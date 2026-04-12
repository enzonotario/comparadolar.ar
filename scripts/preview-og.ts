import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BASE_URL = process.env.OG_BASE_URL ?? "http://localhost:3001";
const OUT_DIR = "preview-og";
const OG_DEFAULT_PNG = join(process.cwd(), "public/assets/og-image.png");

const routes = [
  { path: "/og-brand", name: "og-brand" },
  { path: "/", name: "usd" },
  { path: "/usd-ccl", name: "usd-ccl" },
  { path: "/usdc", name: "usdc" },
  { path: "/usdt", name: "usdt" },
  { path: "/btc", name: "btc" },
  { path: "/eth", name: "eth" },
  { path: "/terminal", name: "terminal-usd" },
  { path: "/terminal/usd-ccl", name: "terminal-usd-ccl" },
  { path: "/terminal/usdc", name: "terminal-usdc" },
  { path: "/terminal/usdt", name: "terminal-usdt" },
  { path: "/terminal/btc", name: "terminal-btc" },
  { path: "/terminal/eth", name: "terminal-eth" },
  { path: "/graficos", name: "graficos-usd" },
  { path: "/graficos/usd-ccl", name: "graficos-usd-ccl" },
  { path: "/graficos/usdc", name: "graficos-usdc" },
  { path: "/graficos/btc", name: "graficos-btc" },
];

function parseOgImageUrl(html: string): string | null {
  const match = html.match(
    /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/,
  );
  return match?.[1] ?? null;
}

async function fetchOgImage(route: {
  path: string;
  name: string;
}): Promise<{ buffer: Buffer; ogUrl: string }> {
  const pageRes = await fetch(`${BASE_URL}${route.path}`);
  if (!pageRes.ok) throw new Error(`page HTTP ${pageRes.status}`);

  const html = await pageRes.text();
  const ogUrl = parseOgImageUrl(html);
  if (!ogUrl) throw new Error("og:image meta tag not found");

  const resolvedUrl = ogUrl.startsWith("http")
    ? ogUrl
    : new URL(ogUrl, BASE_URL).href;
  const imgRes = await fetch(resolvedUrl);
  if (!imgRes.ok)
    throw new Error(`image HTTP ${imgRes.status} for ${resolvedUrl}`);

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  return { buffer, ogUrl: resolvedUrl };
}

async function run(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });

  const results = await Promise.allSettled(
    routes.map(async (route) => {
      const { buffer, ogUrl } = await fetchOgImage(route);
      const out = join(OUT_DIR, `${route.name}.png`);
      writeFileSync(out, buffer);
      if (route.path === "/og-brand") {
        mkdirSync(dirname(OG_DEFAULT_PNG), { recursive: true });
        writeFileSync(OG_DEFAULT_PNG, buffer);
      }
      return { out, ogUrl };
    }),
  );

  console.log("\n  OG Image URLs:\n");
  for (const [i, result] of results.entries()) {
    const name = routes[i]!.name;
    if (result.status === "fulfilled") {
      console.log(`  ${name}:`);
      console.log(`    ${result.value.ogUrl}\n`);
    } else {
      console.error(
        `  ✗ ${name}: ${result.reason instanceof Error ? result.reason.message : result.reason}\n`,
      );
    }
  }

  for (const [i, result] of results.entries()) {
    const name = routes[i]!.name;
    if (result.status === "fulfilled") {
      console.log(`✓  ${name}.png`);
    } else {
      console.error(
        `✗  ${name}: ${result.reason instanceof Error ? result.reason.message : result.reason}`,
      );
    }
  }
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(`\n${ok}/${routes.length} saved to ${OUT_DIR}/`);
  const brandOk = results.some(
    (r, i) => r.status === "fulfilled" && routes[i]?.path === "/og-brand",
  );
  if (brandOk) {
    console.log(`  default OG → ${OG_DEFAULT_PNG}\n`);
  }
}

async function main() {
  await run();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
