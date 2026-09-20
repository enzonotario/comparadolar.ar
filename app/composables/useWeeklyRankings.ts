import type { WeeklyRankingsPayload } from "@/lib/types";
import { getWeeklyRankingsEndpoint } from "@/lib/types";

const EMPTY_RANKINGS: WeeklyRankingsPayload = {
  range: "7d",
  bucket: "1d",
  topN: 5,
  labels: [],
  buy: { series: [] },
  sell: { series: [] },
};

/**
 * Weekly top-N rankings for bump charts.
 */
export function useWeeklyRankings(currency: MaybeRefOrGetter<string>) {
  const currencyValue = computed(() => toValue(currency));
  const url = computed(() => getWeeklyRankingsEndpoint(currencyValue.value));

  const { data, error, status, refresh } = useAsyncData<WeeklyRankingsPayload>(
    () => `rankings-weekly:${url.value}`,
    async () => {
      try {
        return await $fetch<WeeklyRankingsPayload>(url.value);
      } catch {
        return EMPTY_RANKINGS;
      }
    },
    {
      watch: [url],
      default: () => EMPTY_RANKINGS,
    },
  );

  const hasData = computed(() => {
    const payload = data.value;
    if (!payload?.labels?.length) return false;
    return (
      (payload.buy?.series?.length ?? 0) > 0 ||
      (payload.sell?.series?.length ?? 0) > 0
    );
  });

  return {
    data: computed(() => data.value ?? EMPTY_RANKINGS),
    hasData,
    error: computed(() => error.value ?? null),
    isLoading: computed(() => status.value === "pending"),
    refresh,
  };
}
