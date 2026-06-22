import type { CurrencyType } from "~/lib/types";

export function useTerminalPageState(
  currency: Ref<CurrencyType> | ComputedRef<CurrencyType>,
) {
  const { terminalColors } = useTerminalColors(currency);
  const terminalTableRef = ref();

  const providerCount = computed(() => {
    return terminalTableRef.value?.filteredRates?.length || 0;
  });

  const isLoading = computed(() => {
    return terminalTableRef.value?.isLoading ?? true;
  });

  return {
    terminalColors,
    terminalTableRef,
    providerCount,
    isLoading,
  };
}
