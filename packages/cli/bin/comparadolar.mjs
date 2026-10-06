#!/usr/bin/env node
/**
 * Official ComparaDólar CLI — thin client over https://api.comparadolar.ar
 * Usage:
 *   comparadolar health
 *   comparadolar usd
 *   comparadolar quotes usdt
 *   comparadolar openapi
 */

const API = process.env.COMPARADOLAR_API_URL?.replace(/\/$/, "") || "https://api.comparadolar.ar";

const HELP = `comparadolar — public API client for ComparaDólar (Argentina FX & crypto)

When to use: script latest bid/ask without building a custom HTTP client.

Commands:
  health              GET /health
  usd                 GET /usd (latest USD quotes)
  quotes <currency>   GET /{currency}  (usd|usdc|usdt|btc|eth)
  openapi             GET /openapi.json (prints URL + summary)
  help                Show this help

Env:
  COMPARADOLAR_API_URL   Override API base (default ${API})
`;

async function getJson(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${API}${path}`);
  }
  return res.json();
}

function printQuotes(rows) {
  if (!Array.isArray(rows)) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  for (const row of rows) {
    const name = row.prettyName || row.slug || row.name || "?";
    const bid = row.bid ?? row.totalBid ?? "-";
    const ask = row.ask ?? row.totalAsk ?? "-";
    console.log(`${name}\tbuy=${bid}\tsell=${ask}`);
  }
}

const [cmd = "help", arg] = process.argv.slice(2);

try {
  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(HELP);
    process.exit(0);
  }
  if (cmd === "health") {
    console.log(JSON.stringify(await getJson("/health")));
    process.exit(0);
  }
  if (cmd === "usd") {
    printQuotes(await getJson("/usd"));
    process.exit(0);
  }
  if (cmd === "quotes") {
    const currency = (arg || "").toLowerCase();
    if (!["usd", "usdc", "usdt", "btc", "eth"].includes(currency)) {
      console.error("usage: comparadolar quotes <usd|usdc|usdt|btc|eth>");
      process.exit(1);
    }
    printQuotes(await getJson(`/${currency}`));
    process.exit(0);
  }
  if (cmd === "openapi") {
    const spec = await getJson("/openapi.json");
    console.log(`OpenAPI ${spec.openapi} — ${spec.info?.title} v${spec.info?.version}`);
    console.log(`URL: ${API}/openapi.json`);
    console.log(`Paths: ${Object.keys(spec.paths || {}).length}`);
    process.exit(0);
  }
  console.error(`Unknown command: ${cmd}\n`);
  console.log(HELP);
  process.exit(1);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
