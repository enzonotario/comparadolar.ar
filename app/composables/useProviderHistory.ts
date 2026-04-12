import { API_BASE_URL, type CurrencyType } from "~/lib/types";
import { calculateSpread } from "~/lib/utils";

export interface HistoryData {
  bid: number;
  ask: number;
  pct_variation: number;
  timestamp: string;
}

export interface ProviderHistory {
  provider: string;
  data: HistoryData[];
}

export type ValueType = "bid" | "ask" | "spread";

export function useProviderHistory(
  currency: CurrencyType,
  providers: string[],
) {
  const histories = ref<ProviderHistory[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const apiCurrency = currency === "usd-ccl" ? "usd" : currency;

  const fetchHistories = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const promises = providers.map(async (provider) => {
        const response = await $fetch<HistoryData[]>(
          `${API_BASE_URL}/${apiCurrency}/providers/${provider}/history`,
        );
        return { provider, data: response };
      });

      histories.value = await Promise.all(promises);
    } catch (err) {
      error.value = err as Error;
      console.error("Error fetching provider histories:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case "1d":
        start.setDate(now.getDate() - 1);
        break;
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "1m":
        start.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        start.setMonth(now.getMonth() - 6);
        break;
      case "1a":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }

    return { start, end: now };
  };

  const getFilteredData = (range: string) => {
    if (!histories.value || histories.value.length === 0) return [];

    const { start, end } = getDateRange(range);

    return histories.value.map((history) => ({
      provider: history.provider,
      data: history.data
        .filter((item) => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= start && itemDate <= end;
        })
        .map((item) => ({
          bid: item.bid,
          ask: item.ask,
          timestamp: item.timestamp,
          spread: calculateSpread(item.ask, item.bid),
        })),
    }));
  };

  return {
    histories,
    isLoading,
    error,
    fetchHistories,
    getDateRange,
    getFilteredData,
  };
}
