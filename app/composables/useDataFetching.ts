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
  const lastUpdate = ref(new Date());

  const { data, error, status, refresh } = useAsyncData<T>(
    url,
    async () => {
      let result = await $fetch<T>(url);

      if (Array.isArray(result)) {
        result = result.filter(
          (item: any) => !isBlacklistedProvider(item),
        ) as T;

        result.forEach((item: any) => {
          if (item.prettyName && !item.displayName) {
            item.displayName = item.prettyName;
          }

          if (isUsdCclProvider(item)) {
            item.isUsdCcl = true;
          }
        });
      }

      lastUpdate.value = new Date();
      return result;
    },
    {
      server: false,
      lazy: true,
    },
  );

  const isLoading = computed(() => status.value === "pending");

  return {
    data: computed(() => data.value || ([] as unknown as T)),
    error: computed(() => error.value || null),
    isLoading,
    lastUpdate: readonly(lastUpdate),
    refresh: async () => {
      await refresh();
      lastUpdate.value = new Date();
    },
  };
}
