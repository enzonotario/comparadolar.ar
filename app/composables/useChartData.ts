import {
  API_BASE_URL,
  type CurrencyType,
  type ProviderInfo,
} from "~/lib/types";
import {
  filterProvidersCatalogForCurrency,
  useProvidersCatalogForCurrency,
} from "~/composables/useProvidersCatalog";
import type { ValueType } from "~/composables/useProviderHistory";
import { useRouteQuery } from "@vueuse/router";
import { useChartState } from "~/composables/useChartState";

export interface ChartHistoryItem {
  bid: number;
  ask: number;
  timestamp: string;
  spread: number;
}

export interface ProviderHistory {
  provider: string;
  data: ChartHistoryItem[];
}

export interface TimeRange {
  value: string;
  label: string;
}

export interface ValueTypeOption {
  value: ValueType;
  label: string;
}

export const timeRanges: TimeRange[] = [
  { value: "1d", label: "1 día" },
  { value: "7d", label: "7 días" },
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1a", label: "1 año" },
];

export const valueTypes: ValueTypeOption[] = [
  { value: "bid", label: "Compra" },
  { value: "ask", label: "Venta" },
  { value: "spread", label: "Spread" },
];

/**
 * Obtiene el rango de fechas según el período seleccionado
 */
export function getDateRange(range: string) {
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
}

/**
 * Composable para manejar la lógica de datos de gráficos
 */
export function useChartData(
  currency: Ref<CurrencyType> | ComputedRef<CurrencyType>,
) {
  const currencyValue = computed(() => currency.value);
  const apiCurrency = computed(() =>
    currencyValue.value === "usd-ccl" ? "usd" : currencyValue.value,
  );
  const { data: providersDataRaw } = useProvidersCatalogForCurrency(
    currencyValue,
    {
      server: false,
      lazy: true,
    },
  );

  const providersData = computed(() => {
    const data = providersDataRaw.value;
    if (!Array.isArray(data)) return [];
    return filterProvidersCatalogForCurrency(data, currencyValue.value);
  });

  const providerOptions = computed(() => {
    const data = providersData.value;
    if (!data || !Array.isArray(data)) return [];
    return (data as ProviderInfo[]).map((p: ProviderInfo) => ({
      value: p.slug,
      label: p.prettyName || p.name,
    }));
  });

  const providerNames = computed(() => {
    const names: Record<string, string> = {};
    const data = providersData.value;
    if (data && Array.isArray(data)) {
      (data as ProviderInfo[]).forEach((p: ProviderInfo) => {
        names[p.slug] = p.prettyName || p.name;
      });
    }
    return names;
  });

  const {
    loadSavedState,
    saveRangeToStorage,
    saveValueTypeToStorage,
    saveProvidersToStorage,
    clearState,
  } = useChartState();

  const rangeQuery = useRouteQuery<string | null>("range", null);
  const valueTypeQuery = useRouteQuery<string | null>("valueType", null);
  const providersQuery = useRouteQuery<string | null>("providers", null);

  const parseProvidersQuery = (query: string | null): string[] => {
    if (!query) return [];
    return query.split(",").filter((slug) => slug.length > 0);
  };

  const getInitialState = () => {
    const { savedRange, savedValueType, savedProviders } = loadSavedState(
      currencyValue.value,
    );
    const range = rangeQuery.value || savedRange || "1d";
    const valueType = (valueTypeQuery.value ||
      savedValueType ||
      "bid") as ValueType;
    const providers = parseProvidersQuery(
      providersQuery.value || savedProviders || null,
    );

    if (!rangeQuery.value && savedRange) {
      rangeQuery.value = savedRange;
    }
    if (!valueTypeQuery.value && savedValueType) {
      valueTypeQuery.value = savedValueType;
    }
    if (!providersQuery.value && savedProviders) {
      providersQuery.value = savedProviders;
    }

    return { range, valueType, providers };
  };

  const initialState = getInitialState();
  const selectedRange = ref(initialState.range);
  const selectedValueType = ref<ValueType>(initialState.valueType);
  const selectedProviders = ref<string[]>(initialState.providers);

  watch(currencyValue, () => {
    const newState = getInitialState();
    selectedRange.value = newState.range;
    selectedValueType.value = newState.valueType;
    selectedProviders.value = newState.providers;
  });

  watch(
    providerOptions,
    (opts) => {
      if (opts.length > 0) {
        const availableSlugs = opts.map((p: { value: string }) => p.value);
        if (selectedProviders.value.length === 0) {
          selectedProviders.value = availableSlugs;
        } else {
          selectedProviders.value = selectedProviders.value.filter((slug) =>
            availableSlugs.includes(slug),
          );
        }
      }
    },
    { immediate: true },
  );

  watch(selectedRange, (newRange) => {
    rangeQuery.value = newRange || null;
    saveRangeToStorage(currencyValue.value, newRange);
  });

  watch(selectedValueType, (newValueType) => {
    valueTypeQuery.value = newValueType || null;
    saveValueTypeToStorage(currencyValue.value, newValueType);
  });

  watch(
    selectedProviders,
    (newProviders) => {
      const providersString =
        newProviders.length > 0 ? newProviders.join(",") : "";
      providersQuery.value = providersString || null;
      saveProvidersToStorage(currencyValue.value, providersString);
    },
    { deep: true },
  );

  const providerHistories = ref<ProviderHistory[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const loadHistories = async () => {
    if (providerOptions.value.length === 0) return;

    isLoading.value = true;
    error.value = null;

    try {
      const histories = await Promise.all(
        providerOptions.value.map(
          async (opt: { value: string; label: string }) => {
            const response = await $fetch<any[]>(
              `${API_BASE_URL}/${apiCurrency.value}/providers/${opt.value}/history`,
            );
            return {
              provider: opt.value,
              data: response.map((item) => ({
                bid: item.bid,
                ask: item.ask,
                timestamp: item.timestamp,
                spread: ((item.ask - item.bid) / item.bid) * 100,
              })),
            };
          },
        ),
      );

      providerHistories.value = histories;
    } catch (err) {
      error.value = err as Error;
      console.error("Error loading histories:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar historiales cuando estén disponibles los providers
  watch(
    providerOptions,
    (opts) => {
      if (opts.length > 0 && providerHistories.value.length === 0) {
        loadHistories();
      }
    },
    { immediate: true },
  );

  const filteredHistories = computed(() => {
    if (!providerHistories.value) return [];

    const { start, end } = getDateRange(selectedRange.value);
    const selectedSet = new Set(selectedProviders.value);

    return providerHistories.value
      .filter((history) => selectedSet.has(history.provider))
      .map((history) => {
        // Filtrar datos dentro del rango
        const dataInRange = history.data.filter((item) => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= start && itemDate <= end;
        });

        // Si no hay datos en el rango, buscar el último valor anterior al rango
        if (dataInRange.length === 0 && history.data.length > 0) {
          // Ordenar todos los datos por timestamp
          const sortedData = [...history.data].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );

          // Buscar el último valor anterior o igual al inicio del rango
          let lastValueBeforeRange = null;
          for (let i = sortedData.length - 1; i >= 0; i--) {
            const item = sortedData[i];
            if (!item) continue;
            const itemDate = new Date(item.timestamp);
            if (itemDate <= start) {
              lastValueBeforeRange = item;
              break;
            }
          }

          // Si encontramos un valor anterior, lo incluimos con el timestamp del inicio del rango
          // para que aparezca como una línea constante
          if (lastValueBeforeRange) {
            return {
              provider: history.provider,
              data: [
                {
                  ...lastValueBeforeRange,
                  timestamp: start.toISOString(),
                },
              ],
            };
          }
        }

        return {
          provider: history.provider,
          data: dataInRange,
        };
      });
  });

  const resetState = () => {
    selectedRange.value = "1d";
    selectedValueType.value = "bid";
    selectedProviders.value = providerOptions.value.map(
      (p: { value: string }) => p.value,
    );
    rangeQuery.value = null;
    valueTypeQuery.value = null;
    providersQuery.value = null;
    clearState(currencyValue.value);
    const toast = useToast();
    toast.add({
      title: "Estado reiniciado",
      description: "Se han restablecido los filtros a sus valores por defecto",
      color: "success",
      icon: "i-lucide-refresh-ccw",
    });
  };

  return {
    providerOptions,
    providerNames,
    selectedRange,
    selectedValueType,
    selectedProviders,
    providerHistories,
    filteredHistories,
    isLoading,
    error,
    loadHistories,
    resetState,
  };
}
