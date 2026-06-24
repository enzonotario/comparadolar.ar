import { isBlacklistedProvider } from "~/lib/currencies-config";
import { getProviderUsdType, isUsdCclProvider } from "~/lib/market-constants";
import { applyProviderDisplayName, getProviderLogoUrl } from "~/lib/provider-display";

export function useDataFetching<T>(url: string) {
  const lastUpdateIso = useState<string>(`lastUpdate:${url}`, () =>
    new Date().toISOString(),
  );

  const { data, error, status, refresh } = useAsyncData<T>(url, async () => {
    let result = await $fetch<T>(url);

    if (Array.isArray(result)) {
      result = result.filter((item: any) => !isBlacklistedProvider(item)) as T;

      result = result.map((item: any) => {
        let normalized = applyProviderDisplayName(item);

        const logoUrl = getProviderLogoUrl({
          slug: normalized.slug,
          logo: normalized.logo,
          logoUrl: normalized.logoUrl,
        });
        if (logoUrl) {
          normalized = { ...normalized, logoUrl, logo: logoUrl };
        }

        if (normalized.prettyName && !normalized.displayName) {
          normalized = { ...normalized, displayName: normalized.prettyName };
        }

        if (isUsdCclProvider(normalized)) {
          normalized = { ...normalized, isUsdCcl: true };
        }

        normalized = {
          ...normalized,
          usdType: getProviderUsdType(normalized),
        };

        return normalized;
      }) as T;
    }

    lastUpdateIso.value = new Date().toISOString();
    return result;
  });

  const isLoading = computed(() => status.value === "pending");
  const lastUpdate = computed(() => new Date(lastUpdateIso.value));

  return {
    data: computed(() => data.value || ([] as unknown as T)),
    error: computed(() => error.value || null),
    isLoading,
    lastUpdate: readonly(lastUpdate),
    refresh: async () => {
      await refresh();
      lastUpdateIso.value = new Date().toISOString();
    },
  };
}
