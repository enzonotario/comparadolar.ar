import type { CurrencyType } from "~/lib/types";
import { isValidCurrency } from "~/lib/currencies-config";

/**
 * Composable para obtener currency de forma consistente desde route params o valor por defecto
 */
export function useCurrency(defaultCurrency: CurrencyType = "usd") {
  const route = useRoute();

  const currency = computed(() => {
    const routeCurrency = route.params.currency as string | undefined;

    if (routeCurrency && isValidCurrency(routeCurrency)) {
      return routeCurrency as CurrencyType;
    }

    return defaultCurrency;
  });

  return {
    currency: readonly(currency),
  };
}
