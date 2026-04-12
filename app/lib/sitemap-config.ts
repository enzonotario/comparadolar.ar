import { API_BASE_URL } from "./types";
import { currencies, USD_CCL_PROVIDERS } from "./currencies-config";

export async function getSitemapUrls() {
  const urls: any[] = [];

  // Rutas estáticas base
  urls.push({
    loc: "/",
    changefreq: "daily",
    priority: 1.0,
  });
  urls.push({
    loc: "/graficos",
    changefreq: "daily",
    priority: 0.8,
  });
  urls.push({
    loc: "/terminal",
    changefreq: "daily",
    priority: 0.8,
  });
  urls.push({
    loc: "/sumarse",
    changefreq: "monthly",
    priority: 0.5,
  });

  for (const currency of currencies) {
    // Rutas de índice de moneda
    if (currency.route !== "/") {
      urls.push({
        loc: currency.route,
        changefreq: "daily",
        priority: 0.9,
      });
    }

    // Páginas de herramientas por moneda
    urls.push({
      loc: `/graficos/${currency.value}`,
      changefreq: "daily",
      priority: 0.7,
    });
    urls.push({
      loc: `/terminal/${currency.value}`,
      changefreq: "daily",
      priority: 0.7,
    });

    try {
      // Fetch de proveedores en tiempo de build
      const apiCurrency = currency.value === "usd-ccl" ? "usd" : currency.value;
      const response = await fetch(`${API_BASE_URL}/${apiCurrency}`);
      const data = (await response.json()) as any[];

      if (Array.isArray(data)) {
        for (const provider of data) {
          if (!provider.slug) continue;

          // Filtrado para USD CCL
          if (currency.value === "usd-ccl") {
            if (USD_CCL_PROVIDERS.includes(provider.slug)) {
              urls.push({
                loc: `/${currency.value}/${provider.slug}`,
                changefreq: "daily",
                priority: 0.6,
              });
            }
            continue;
          }

          // Rutas de proveedores generales
          urls.push({
            loc: `/${currency.value}/${provider.slug}`,
            changefreq: "daily",
            priority: 0.6,
          });
        }
      }
    } catch (e) {
      console.error(`Error sitemap para ${currency.value}:`, e);
    }
  }

  return urls;
}
