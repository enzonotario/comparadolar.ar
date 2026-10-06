import { getCurrencyConfig, isValidCurrency } from "~/lib/currencies-config";
import type { CurrencyType } from "~/lib/types";
import { isCryptoCurrency, toApiCurrency } from "~/lib/market-constants";

/**
 * Validate the raw route param. Do not use useCurrency() here — that helper
 * falls back to USD and would turn unknown paths into soft-200 pages.
 */
export function useValidatedRouteCurrency(
  notFoundMessage = "Moneda no soportada",
) {
  const route = useRoute();
  const rawParam = route.params.currency;
  const rawCurrency = Array.isArray(rawParam) ? rawParam[0] : rawParam;

  if (!rawCurrency || !isValidCurrency(rawCurrency)) {
    throw createError({
      statusCode: 404,
      statusMessage: notFoundMessage,
      fatal: true,
    });
  }

  const currency = computed(() => rawCurrency as CurrencyType);

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
