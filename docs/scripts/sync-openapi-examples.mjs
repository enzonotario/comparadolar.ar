/**
 * Genera docs/public/openapi.json: paths por token (/usd, /usdc, …) y ejemplos
 * reales (slugs y muestras de lista de proveedores) obtenidos de la API.
 *
 * Uso (desde docs/): node scripts/sync-openapi-examples.mjs
 *            o: pnpm openapi:sync
 * Opcional: OPENAPI_BASE_URL=https://api.comparadolar.ar
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/openapi.json");

const BASE =
  process.env.OPENAPI_BASE_URL?.replace(/\/$/, "") ||
  "https://api.comparadolar.ar";

const CURRENCIES = [
  {
    path: "usd",
    tagQuotes: "Cotizaciones",
    descQuotes: "Última cotización por proveedor para **usd**.",
    quoteItemsRef: "#/components/schemas/FiatQuote",
    providerItemsRef: "#/components/schemas/ProviderFiat",
    historyItemsRef: "#/components/schemas/HistoryPointFiat",
  },
  ...["usdc", "usdt", "btc", "eth"].map((path) => ({
    path,
    tagQuotes: "Cotizaciones",
    descQuotes: `Última cotización por exchange para **${path}**.`,
    quoteItemsRef: "#/components/schemas/CryptoQuote",
    providerItemsRef: "#/components/schemas/ProviderCrypto",
    historyItemsRef: "#/components/schemas/HistoryPointCrypto",
  })),
];

const MAX_SLUG_EXAMPLES = 100;
const PROVIDER_SAMPLE_ITEMS = 3;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

function slugExamples(slugs) {
  const slice = slugs.slice(0, MAX_SLUG_EXAMPLES);
  const examples = {};
  for (const s of slice) {
    examples[s] = { summary: s, value: s };
  }
  return examples;
}

const HISTORY_SAMPLE_POINTS = 3;

function buildPaths(fetched) {
  const paths = {};

  for (const c of CURRENCIES) {
    const { slugs, providersSample, historySample } = fetched[c.path];
    const firstSlug = slugs[0] ?? "proveedor";
    const token = c.path.toUpperCase();

    paths[`/${c.path}`] = {
      get: {
        tags: [c.tagQuotes],
        operationId: `get${capitalizeToken(c.path)}Quotes`,
        summary: `${token} ahora`,
        description: c.descQuotes,
        responses: {
          200: {
            description: "Lista de cotizaciones",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: c.quoteItemsRef },
                },
              },
            },
          },
        },
      },
    };

    paths[`/${c.path}/providers`] = {
      get: {
        tags: ["Proveedores"],
        operationId: `list${capitalizeToken(c.path)}Providers`,
        summary: `Proveedores ${token}`,
        description:
          "Catálogo de proveedores o exchanges con metadatos para armar selectores y enlaces.",
        responses: {
          200: {
            description: "Lista de proveedores",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: c.providerItemsRef },
                },
                examples: {
                  muestra: {
                    summary: `Primeros ${providersSample.length} registros`,
                    value: providersSample,
                  },
                },
              },
            },
          },
        },
      },
    };

    paths[`/${c.path}/providers/{slug}/history`] = {
      get: {
        tags: ["Historial"],
        operationId: `get${capitalizeToken(c.path)}ProviderHistory`,
        summary:
          c.path === "usd"
            ? `Historial ${token} por proveedor`
            : `Historial ${token} por exchange`,
        description:
          c.path === "usd"
            ? "Serie temporal: `bid`, `ask`, `timestamp` por punto."
            : "Serie temporal con montos spot y totales por lado del libro.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description:
              c.path === "usd"
                ? "Slug del proveedor (mismo valor que en `/providers`)."
                : "Slug del exchange (mismo valor que en `/providers`).",
            schema: {
              type: "string",
              example: firstSlug,
            },
            examples: slugExamples(slugs),
          },
        ],
        responses: {
          200: {
            description: "Puntos de historial",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: c.historyItemsRef },
                },
                ...(historySample.length > 0
                  ? {
                      examples: {
                        puntos: {
                          summary: `Primeros puntos (${firstSlug})`,
                          value: historySample,
                        },
                      },
                    }
                  : {}),
              },
            },
          },
        },
      },
    };
  }

  return paths;
}

function capitalizeToken(path) {
  return path
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

async function main() {
  const providerLists = await Promise.all(
    CURRENCIES.map((c) => fetchJson(`${BASE}/${c.path}/providers`)),
  );

  for (let i = 0; i < CURRENCIES.length; i++) {
    const list = providerLists[i];
    if (!Array.isArray(list)) {
      throw new Error(
        `Se esperaba array en ${BASE}/${CURRENCIES[i].path}/providers`,
      );
    }
  }

  const historySamples = await Promise.all(
    CURRENCIES.map(async (c, i) => {
      const list = providerLists[i];
      const slugs = list
        .map((p) => p.slug)
        .filter(Boolean)
        .sort();
      const firstSlug = slugs[0];
      if (!firstSlug) return [];
      try {
        const full = await fetchJson(
          `${BASE}/${c.path}/providers/${encodeURIComponent(firstSlug)}/history`,
        );
        return Array.isArray(full) ? full.slice(0, HISTORY_SAMPLE_POINTS) : [];
      } catch {
        return [];
      }
    }),
  );

  const fetched = {};
  for (let i = 0; i < CURRENCIES.length; i++) {
    const c = CURRENCIES[i];
    const list = providerLists[i];
    const slugs = list
      .map((p) => p.slug)
      .filter(Boolean)
      .sort();
    fetched[c.path] = {
      slugs,
      providersSample: list.slice(0, PROVIDER_SAMPLE_ITEMS),
      historySample: historySamples[i],
    };
  }

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "ComparaDolar API",
      description:
        "API pública de comparadolar.ar para cotizaciones de dólar y criptomonedas en Argentina.\n\n<br/>¿Encontraste útil esta API? **¡Dejá tu ⭐ en [GitHub](https://github.com/enzonotario/comparadolar.ar)!**",
      version: "1.0.0",
    },
    servers: [
      {
        url: BASE,
        description: "Producción",
      },
    ],
    tags: [
      {
        name: "Cotizaciones",
        description: "Listados de cotización vigente por moneda o activo.",
      },
      {
        name: "Proveedores",
        description: "Catálogo de proveedores por moneda.",
      },
      {
        name: "Historial",
        description: "Series temporales de cotización por proveedor.",
      },
    ],
    paths: buildPaths(fetched),
    components: {
      schemas: {
        FiatQuote: {
          type: "object",
          required: ["slug", "name", "bid", "ask"],
          properties: {
            slug: { type: "string" },
            name: { type: "string" },
            bid: { type: "number" },
            ask: { type: "number" },
            logoUrl: { type: "string" },
            is24x7: { type: "boolean" },
            url: { type: "string" },
            prettyName: { type: "string" },
            pct_variation: { type: "number" },
            slowChange: { type: "boolean" },
            isBank: { type: "boolean" },
          },
        },
        CryptoQuote: {
          type: "object",
          required: ["slug", "ask", "totalAsk", "bid", "totalBid", "time"],
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            ask: { type: "number" },
            totalAsk: { type: "number" },
            bid: { type: "number" },
            totalBid: { type: "number" },
            time: {
              type: "number",
              description: "Marca de tiempo Unix (segundos o ms según origen).",
            },
            logo: { type: "string" },
            prettyName: { type: "string" },
            url: { type: "string" },
          },
        },
        ProviderFiat: {
          type: "object",
          required: ["slug", "name", "logoUrl", "is24x7", "url", "prettyName"],
          properties: {
            slug: { type: "string" },
            name: { type: "string" },
            logoUrl: { type: "string" },
            is24x7: { type: "boolean" },
            url: { type: "string" },
            prettyName: { type: "string" },
            slowChange: { type: "boolean" },
            isBank: { type: "boolean" },
          },
        },
        ProviderCrypto: {
          type: "object",
          required: ["slug", "prettyName", "url", "is24x7"],
          properties: {
            slug: { type: "string" },
            logo: { type: "string" },
            prettyName: { type: "string" },
            url: { type: "string" },
            is24x7: { type: "boolean" },
          },
        },
        HistoryPointFiat: {
          type: "object",
          required: ["bid", "ask", "timestamp"],
          properties: {
            bid: { type: "number" },
            ask: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        HistoryPointCrypto: {
          type: "object",
          required: ["ask", "totalAsk", "bid", "totalBid", "timestamp"],
          properties: {
            ask: { type: "number" },
            totalAsk: { type: "number" },
            bid: { type: "number" },
            totalBid: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
  };

  writeFileSync(OUT, `${JSON.stringify(spec, null, 2)}\n`, "utf8");
  console.log(`Escrito ${OUT}`);
  for (const c of CURRENCIES) {
    const n = fetched[c.path].slugs.length;
    console.log(
      `  ${c.path}: ${n} slugs, ejemplo lista: ${n ? fetched[c.path].slugs[0] : "—"}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
