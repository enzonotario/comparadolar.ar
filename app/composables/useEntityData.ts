import type { CurrencyType, ProviderInfo } from "@/lib/types";
import {
  toProvidersCatalogApi,
  useProvidersCatalog,
} from "@/composables/useProvidersCatalog";

interface EntityDataResult {
  data: ComputedRef<ProviderInfo[] | null>;
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<Error | null>;
  currency: CurrencyType;
  entityName: string;
  refresh: () => Promise<void>;
}

export function useEntityData(
  currency: CurrencyType,
  entityParam: string,
): EntityDataResult {
  const apiCurrency = toProvidersCatalogApi(currency);
  const {
    data,
    status,
    error,
    refresh: refreshCatalog,
  } = useProvidersCatalog(apiCurrency, {
    lazy: false,
    server: true,
  });

  return {
    data: computed(() => data.value ?? null),
    isLoading: computed(() => status.value === "pending"),
    error: computed(() => error.value ?? null),
    currency,
    entityName: entityParam,
    refresh: refreshCatalog,
  };
}
