import { getCurrencyConfig, isValidCurrency } from "~/lib/currencies-config";
import type { CurrencyType } from "~/lib/types";
import { isCryptoCurrency, toApiCurrency } from "~/lib/market-constants";

export function useValidatedRouteCurrency(
  notFoundMessage = "Moneda no soportada",
) {
  const { currency } = useCurrency();

  if (!isValidCurrency(currency.value)) {
    throw createError({
      statusCode: 404,
      statusMessage: notFoundMessage,
    });
  }

  const currencyConfig = computed(() =>
    getCurrencyConfig(currency.value as CurrencyType),
  );
  const apiCurrency = computed(() =>
    toApiCurrency(currency.value as CurrencyType),
  );
  const isCrypto = computed(() => isCryptoCurrency(currency.value));
  const isCcl = computed(() => currency.value === "usd-ccl");
  const isFiat = computed(
    () => currency.value === "usd" || currency.value === "usd-ccl",
  );

  return {
    currency,
    currencyConfig,
    apiCurrency,
    isCrypto,
    isCcl,
    isFiat,
  };
}
