import {
  API_BASE_URL,
  type CurrencyType,
  type ProviderInfo,
} from "@/lib/types";

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
  const apiCurrency = currency === "usd-ccl" ? "usd" : currency;
  const { data, isLoading, error, refresh } = useDataFetching<ProviderInfo[]>(
    `${API_BASE_URL}/${apiCurrency}/providers`,
  );

  return {
    data,
    isLoading,
    error,
    currency,
    entityName: entityParam,
    refresh,
  };
}
