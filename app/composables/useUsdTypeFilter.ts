import {
  USD_FILTER_CATEGORIES,
  matchesUsdTypeFilter,
} from "~/lib/market-constants";
import type { UsdFilterCategory } from "~/lib/types";

const STORAGE_KEY = "comparadolar-usd-type-filter";

function defaultEnabledTypes(): Record<UsdFilterCategory, boolean> {
  return {
    Oficial: true,
    MEP: true,
    CCL: true,
    Cripto: true,
  };
}

function mergeEnabledTypes(
  stored: Partial<Record<UsdFilterCategory, boolean>> | null | undefined,
): Record<UsdFilterCategory, boolean> {
  const defaults = defaultEnabledTypes();
  if (!stored || typeof stored !== "object") return defaults;

  return USD_FILTER_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = stored[category] ?? defaults[category];
      return acc;
    },
    {} as Record<UsdFilterCategory, boolean>,
  );
}

export const useUsdTypeFilter = () => {
  const enabledTypes = useState<Record<UsdFilterCategory, boolean>>(
    "usd-type-filter",
    defaultEnabledTypes,
  );
  const hydrated = useState("usd-type-filter-hydrated", () => false);

  const hydratePreference = () => {
    if (!import.meta.client || hydrated.value) return;
    hydrated.value = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        enabledTypes.value = mergeEnabledTypes(JSON.parse(stored));
      }
    } catch {
      // Ignore invalid stored values.
    }
  };

  onMounted(hydratePreference);

  const setTypeEnabled = (category: UsdFilterCategory, enabled: boolean) => {
    enabledTypes.value = {
      ...enabledTypes.value,
      [category]: enabled,
    };

    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledTypes.value));
    }
  };

  const matchesFilter = (item: Parameters<typeof matchesUsdTypeFilter>[0]) =>
    matchesUsdTypeFilter(item, enabledTypes.value);

  return {
    enabledTypes,
    categories: USD_FILTER_CATEGORIES,
    setTypeEnabled,
    matchesFilter,
  };
};
