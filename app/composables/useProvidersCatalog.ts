import { computed, type MaybeRefOrGetter, toValue } from "vue";
import {
  USD_CCL_PROVIDERS,
  isBlacklistedProvider,
} from "~/lib/currencies-config";
import type { CurrencyType, ProviderInfo } from "~/lib/types";
import { API_BASE_URL } from "~/lib/types";

/** API base paths that expose `/providers` (USD sirve también para USD CCL). */
export type ProvidersCatalogApi = "usd" | "usdc" | "usdt" | "btc" | "eth";

export function toProvidersCatalogApi(
  currency: CurrencyType,
): ProvidersCatalogApi {
  return currency === "usd-ccl" ? "usd" : currency;
}

function catalogAsyncKey(api: ProvidersCatalogApi): string {
  return `providers-catalog:${api}`;
}

/** La API suele mandar `logo`; en el front tipamos `logoUrl` (p. ej. paleta de búsqueda). */
function normalizeCatalogProvider(
  raw: ProviderInfo & { logo?: string },
): ProviderInfo {
  const slug = raw.slug ?? "";
  const logoUrl = raw.logoUrl || raw.logo || "";
  return {
    slug,
    name: raw.name || slug,
    logoUrl,
    is24x7: raw.is24x7 ?? true,
    url: raw.url ?? "",
    prettyName: raw.prettyName || raw.name || slug,
    isBank: Boolean(raw.isBank),
  };
}

export async function fetchNormalizedProviders(
  api: ProvidersCatalogApi,
): Promise<ProviderInfo[]> {
  const url = `${API_BASE_URL}/${api}/providers`;
  let result = await $fetch<(ProviderInfo & { logo?: string })[]>(url);

  if (!Array.isArray(result)) return [];

  result = result
    .map(normalizeCatalogProvider)
    .filter((item) => !isBlacklistedProvider(item));

  result.forEach((item: ProviderInfo & { displayName?: string }) => {
    if (item.prettyName && !item.displayName) {
      item.displayName = item.prettyName;
    }
  });

  return result;
}

export function filterProvidersCatalogForCurrency(
  providers: ProviderInfo[],
  currency: CurrencyType,
): ProviderInfo[] {
  const data = [...providers];

  const isUsdCclProvider = (provider: ProviderInfo) => {
    const slug = provider.slug?.toLowerCase() || "";
    const name = provider.name?.toLowerCase() || "";
    return USD_CCL_PROVIDERS.some((p) => slug === p || name === p);
  };

  if (currency === "usd-ccl") {
    return data.filter(isUsdCclProvider);
  }

  if (currency === "usd") {
    return data.filter((provider) => !isUsdCclProvider(provider));
  }

  return data;
}

/** Ruta canónica de ficha de proveedor (alineada con RelatedProviders). */
export function getProviderEntityPath(
  currency: CurrencyType,
  slug: string,
): string {
  if (currency === "usd") {
    return `/usd/${slug}`;
  }
  return `/${currency}/${slug}`;
}

export interface UseProvidersCatalogOptions {
  lazy?: boolean;
  server?: boolean;
}

/**
 * Catálogo `/providers` deduplicado por `api` vía `useAsyncData` (misma key → mismo cache).
 */
export function useProvidersCatalog(
  apiCurrency: MaybeRefOrGetter<ProvidersCatalogApi>,
  options?: UseProvidersCatalogOptions,
) {
  const api = computed(() => toValue(apiCurrency));
  const key = computed(() => catalogAsyncKey(api.value));

  return useAsyncData(key, () => fetchNormalizedProviders(api.value), {
    lazy: options?.lazy ?? false,
    server: options?.server ?? false,
    watch: [api],
  });
}

export function useProvidersCatalogForCurrency(
  currency: MaybeRefOrGetter<CurrencyType>,
  options?: UseProvidersCatalogOptions,
) {
  const api = computed(() =>
    toProvidersCatalogApi(toValue(currency) as CurrencyType),
  );
  return useProvidersCatalog(api, options);
}

/** APIs que tienen endpoint propio `/providers`. */
export const PROVIDERS_CATALOG_APIS: ProvidersCatalogApi[] = [
  "usd",
  "usdt",
  "usdc",
  "btc",
  "eth",
];

export type ProvidersCatalogHandle = ReturnType<typeof useProvidersCatalog>;

/** Mapa estable de handles por API (registra dedupe en setup). */
export function useProvidersCatalogRegistry(): Record<
  ProvidersCatalogApi,
  ProvidersCatalogHandle
> {
  const usd = useProvidersCatalog("usd", { lazy: true });
  const usdt = useProvidersCatalog("usdt", { lazy: true });
  const usdc = useProvidersCatalog("usdc", { lazy: true });
  const btc = useProvidersCatalog("btc", { lazy: true });
  const eth = useProvidersCatalog("eth", { lazy: true });

  return { usd, usdt, usdc, btc, eth };
}

/** Evita nuevos fetch si el catálogo ya terminó (vacío o no). Misma key → sin requests duplicados. */
export async function ensureProvidersCatalogsLoaded(
  catalogs: Record<ProvidersCatalogApi, ProvidersCatalogHandle>,
): Promise<void> {
  await Promise.all(
    PROVIDERS_CATALOG_APIS.map(async (api) => {
      const c = catalogs[api];
      if (c.status.value === "success") return;
      await c.execute();
    }),
  );
}
