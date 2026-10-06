/** Static Markdown bodies for Accept: text/markdown negotiation. */

export const HOMEPAGE_MARKDOWN = `# ComparaDólar

> Cotizaciones de dólar oficial, MEP, CCL y criptomonedas (USDC, USDT, BTC, ETH) en Argentina. Compará compra y venta entre bancos, exchanges y apps.

## When to use ComparaDólar

Use ComparaDólar when you need current Argentine FX or crypto quote comparison across many providers, without scraping each bank site yourself.

- Compare USD bid/ask across banks and wallets (Oficial, MEP, Cripto, CCL filters on the site).
- Read provider detail pages with history charts.
- Call the public JSON API for automation, dashboards, and agents.

## Public API

Base URL: https://api.comparadolar.ar

- OpenAPI: https://comparadolar.ar/openapi.json
- API docs: https://comparadolar.ar/docs/
- Health: https://api.comparadolar.ar/health
- Latest USD quotes: https://api.comparadolar.ar/usd
- Latest USDT quotes: https://api.comparadolar.ar/usdt
- Provider history example: https://api.comparadolar.ar/usd/providers/banco-nacion/history

No API key is required for public GET endpoints.

## Agent resources

- [llms.txt](https://comparadolar.ar/llms.txt): when-to-use guidance and resource map
- [OpenAPI](https://comparadolar.ar/openapi.json): machine-readable API surface
- [About](https://comparadolar.ar/about): who we are
- [Contact](https://comparadolar.ar/contact): how to reach us
- [Privacy](https://comparadolar.ar/privacy): privacy policy
- [Sitemap](https://comparadolar.ar/sitemap.xml)

## Site map (humans)

- Home / USD table: https://comparadolar.ar/
- Terminal view: https://comparadolar.ar/terminal/usd
- Charts: https://comparadolar.ar/graficos/usd
- Remesas: https://comparadolar.ar/remesas
- Integrate a provider: https://comparadolar.ar/sumarse
`;

export const NOT_FOUND_MARKDOWN = `# 404 — Page not found

The path you requested does not exist on ComparaDólar (https://comparadolar.ar).

## What to try next

- Home: https://comparadolar.ar/
- Agent map: https://comparadolar.ar/llms.txt
- OpenAPI: https://comparadolar.ar/openapi.json
- API docs: https://comparadolar.ar/docs/
- Sitemap: https://comparadolar.ar/sitemap.xml
- Contact: https://comparadolar.ar/contact

ComparaDólar compares Argentine dollar and crypto quotes. Use the public API at https://api.comparadolar.ar for machine-readable rates.
`;

export const ABOUT_MARKDOWN = `# About ComparaDólar

ComparaDólar (https://comparadolar.ar) is an Argentine comparison product for FX and crypto quotes. We collect buy and sell prices from banks, brokers, and wallets, then show them in one table so people can decide where to operate.

We publish a free public JSON API at https://api.comparadolar.ar and OpenAPI at https://comparadolar.ar/openapi.json. Agents and developers can read latest quotes and history without an API key.

Contact: https://comparadolar.ar/contact — Privacy: https://comparadolar.ar/privacy — Docs: https://comparadolar.ar/docs/
`;

export const CONTACT_MARKDOWN = `# Contact ComparaDólar

Email: hi@enzonotario.me

Use this address for API questions, provider integration (see https://comparadolar.ar/sumarse), corrections, and partnership requests.

Site: https://comparadolar.ar — API: https://api.comparadolar.ar — Docs: https://comparadolar.ar/docs/ — OpenAPI: https://comparadolar.ar/openapi.json
`;

export const PRIVACY_MARKDOWN = `# Privacy — ComparaDólar

ComparaDólar shows public market quotes. We do not require an account to browse rates.

We may use privacy-respecting analytics and standard server logs (IP, user agent, path) to keep the service reliable. We do not sell personal data. The public API at https://api.comparadolar.ar returns market data only.

For privacy questions, email hi@enzonotario.me. More: https://comparadolar.ar/about and https://comparadolar.ar/contact.
`;

const KNOWN_MARKDOWN: Record<string, string> = {
  "/": HOMEPAGE_MARKDOWN,
  "/about": ABOUT_MARKDOWN,
  "/contact": CONTACT_MARKDOWN,
  "/privacy": PRIVACY_MARKDOWN,
};

export function markdownForPath(pathname: string): string | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return KNOWN_MARKDOWN[normalized] ?? KNOWN_MARKDOWN[pathname] ?? null;
}

/** Paths Nitro should not short-circuit (static / Nuxt internals). */
export function shouldSkipMarkdownNegotiation(pathname: string): boolean {
  if (!pathname || pathname === "/") return false;
  return (
    pathname.startsWith("/_nuxt") ||
    pathname.startsWith("/__nuxt") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/mascots") ||
    pathname.startsWith("/fonts") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".woff2")
  );
}
