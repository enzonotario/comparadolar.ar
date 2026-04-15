import {
  USD_CCL_PROVIDERS,
  isBlacklistedProvider,
} from "~/lib/currencies-config";

const isUsdCclProvider = (item: any): boolean => {
  const slug = item.slug?.toLowerCase() || "";
  const name = item.name?.toLowerCase() || "";
  return USD_CCL_PROVIDERS.some(
    (provider) => slug === provider || name === provider,
  );
};

export function useDataFetching<T>(url: string) {
  const lastUpdateIso = useState<string>(`lastUpdate:${url}`, () =>
    new Date().toISOString(),
  );

  const { data, error, status, refresh } = useAsyncData<T>(url, async () => {
    let result = await $fetch<T>(url);

    if (Array.isArray(result)) {
      result = result.filter((item: any) => !isBlacklistedProvider(item)) as T;

      result.forEach((item: any) => {
        if (item.prettyName && !item.displayName) {
          item.displayName = item.prettyName;
        }

        if (isUsdCclProvider(item)) {
          item.isUsdCcl = true;
        }
      });
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
