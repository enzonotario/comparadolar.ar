import type { TrendsPayload, TrendSeries } from "@/lib/types";
import { getTrendsEndpoint } from "@/lib/types";

/**
 * Lazy short-history for list sparklines.
 * Does not block the primary quotes fetch (lazy + client).
 */
export function useProviderTrends(currency: MaybeRefOrGetter<string>) {
  const currencyValue = computed(() => toValue(currency));
  const url = computed(() => getTrendsEndpoint(currencyValue.value));

  const { data, error, status, refresh } = useAsyncData<TrendsPayload>(
    () => `trends:${url.value}`,
    async () => {
      try {
        return await $fetch<TrendsPayload>(url.value);
      } catch {
        // Trends are progressive enhancement; quotes already loaded.
        return {
          range: "7d" as const,
          bucket: "1h" as const,
          providers: {},
        };
      }
    },
    {
      lazy: true,
      server: false,
      watch: [url],
      default: () => ({
        range: "7d",
        bucket: "1h",
        providers: {},
      }),
    },
  );

  const providers = computed(() => data.value?.providers ?? {});

  function getSeries(
    slug: string,
    side: "buy" | "sell",
  ): number[] {
    const series = providers.value[slug] as TrendSeries | undefined;
    if (!series) return [];
    return side === "buy" ? series.ask : series.bid;
  }

  return {
    providers,
    getSeries,
    error: computed(() => error.value ?? null),
    isLoading: computed(() => status.value === "pending"),
    refresh,
  };
}
