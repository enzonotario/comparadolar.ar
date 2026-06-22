import {
  API_BASE_URL,
  SITE_CONFIG,
  type CurrencyType,
  type ExchangeRate,
} from "~/lib/types";
import {
  getCurrencyConfig,
  getCurrencyRoute,
  isValidCurrency,
} from "~/lib/currencies-config";
import { toApiCurrency } from "~/lib/market-constants";

export function useProviderPage() {
  definePageMeta({
    layout: "minimal",
  });

  const route = useRoute();
  const currency = route.params.currency as string;
  const entity = route.params.entity as string;

  if (!currency || !entity) {
    throw createError({
      statusCode: 400,
      statusMessage: "Parámetros inválidos",
    });
  }

  if (!isValidCurrency(currency)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Moneda no soportada",
    });
  }

  const { data, isLoading, error, refresh } = useEntityData(
    currency as CurrencyType,
    entity,
  );

  const apiCurrency = toApiCurrency(currency);

  const { data: ratesData, refresh: refreshRates } = useDataFetching<
    ExchangeRate[]
  >(`${API_BASE_URL}/${apiCurrency}`);

  const rates = computed(() => ratesData.value ?? []);

  const handleRetry = () => {
    refresh();
    refreshRates();
  };

  const rateData = computed(() => {
    return rates.value.find((rate) => rate.slug === entity) ?? null;
  });

  const allProviders = computed(() => {
    if (!data.value) return [];

    return data.value.map((provider) => {
      const rateInfo = rates.value.find((rate) => rate.slug === provider.slug);
      return {
        ...provider,
        bid: rateInfo?.bid,
        ask: rateInfo?.ask,
      };
    });
  });

  const currentProvider = computed(() => {
    if (!data.value || !allProviders.value) return null;
    return allProviders.value.find((provider) => provider.slug === entity);
  });

  const seoTitle = computed(() => {
    const provider = currentProvider.value;
    if (provider) {
      return `Cotización de ${currency.toUpperCase()} en ${provider.prettyName} | ${SITE_CONFIG.name}`;
    }
    return `Cotización de ${currency.toUpperCase()} | ${SITE_CONFIG.name}`;
  });

  const seoDescription = computed(() => {
    const provider = currentProvider.value;
    const sym = currency.toUpperCase();
    if (provider) {
      return `Cotización ${sym} en ${provider.prettyName}: precio al instante e histórico en ComparaDólar. Compará spread y tasas con el resto del mercado en Argentina.`;
    }
    return `Cotización ${sym} en ComparaDólar: precios al instante, histórico y comparación con el mercado para decidir con claridad en Argentina.`;
  });

  useSeo({
    title: seoTitle,
    description: seoDescription,
    currency: currency as CurrencyType,
  });

  const comparisonTablePath = computed(() =>
    getCurrencyRoute(currency as CurrencyType),
  );

  const categoryFullName = computed(() => {
    const cfg = getCurrencyConfig(currency as CurrencyType);
    return cfg?.fullName ?? currency.toUpperCase();
  });

  return {
    currency,
    entity,
    data,
    isLoading,
    error,
    handleRetry,
    rateData,
    allProviders,
    currentProvider,
    comparisonTablePath,
    categoryFullName,
  };
}
