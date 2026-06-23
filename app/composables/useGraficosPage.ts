import type { CurrencyConfig } from "~/lib/currencies-config";
import { API_BASE_URL, SITE_CONFIG, type CurrencyType } from "~/lib/types";
import { RATE_LABELS } from "~/lib/rate-labels";
import {
  top3SlugsForBuyCrypto,
  top3SlugsForBuyUsd,
  top3SlugsForBuyUsdCcl,
  buildOgChartLines,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

export function getGraficosTop3Slugs(options: {
  currency: CurrencyType;
  isCrypto: boolean;
  isCcl: boolean;
  rates: unknown[] | null;
}) {
  const { isCrypto, isCcl, rates } = options;
  if (isCrypto) return top3SlugsForBuyCrypto(rates ?? []);
  if (isCcl) return top3SlugsForBuyUsdCcl(rates ?? []);
  return top3SlugsForBuyUsd(rates ?? [], shouldOgShowOnly24x7());
}

export function buildGraficosOgImage(options: {
  currency: CurrencyType;
  currencyConfig?: CurrencyConfig;
  histories: Array<{
    name: string;
    data: Array<{ bid: number; ask: number; timestamp: string }>;
  }>;
}) {
  const { currency, currencyConfig, histories } = options;
  const since3Days = new Date();
  since3Days.setDate(since3Days.getDate() - 3);

  const { lines, yTicks } = buildOgChartLines(histories, since3Days, 960, 200);

  return {
    title:
      currency === "usd"
        ? "Dólar"
        : (currencyConfig?.fullName ?? currency.toUpperCase()),
    lines,
    yTicks,
    accentColor: currencyConfig?.gradientColors.from ?? "#10b981",
    updatedAt: ogUpdatedAtDate(),
    priceLabel: RATE_LABELS.ask,
  };
}

export function useGraficosPage() {
  definePageMeta({
    layout: "minimal",
  });

  const routeContext = useValidatedRouteCurrency();
  const { currency, currencyConfig, apiCurrency, isCrypto, isCcl } =
    routeContext;

  useSeo({
    title: computed(
      () => `Gráficos ${currency.value.toUpperCase()} | ${SITE_CONFIG.name}`,
    ),
    description: computed(
      () =>
        `Gráficos de ${currency.value.toUpperCase()} en ComparaDólar: histórico, comparación de proveedores y tendencias. Analizá el tipo de cambio en Argentina con datos en tiempo real.`,
    ),
  });

  const { data: ogBundle } = useAsyncData(
    computed(() => `og-graficos-${currency.value}`),
    async () => {
      const rates = await $fetch<any[]>(
        `${API_BASE_URL}/${apiCurrency.value}`,
      );
      const top3 = getGraficosTop3Slugs({
        currency: currency.value,
        isCrypto: isCrypto.value,
        isCcl: isCcl.value,
        rates,
      });
      const histories = await Promise.all(
        top3.map(async ({ slug, name }) => {
          const data = await $fetch<
            Array<{ bid: number; ask: number; timestamp: string }>
          >(
            `${API_BASE_URL}/${apiCurrency.value}/providers/${slug}/history`,
          );
          return { name, data };
        }),
      );
      return { histories };
    },
  );

  const ogProps = computed(() =>
    buildGraficosOgImage({
      currency: currency.value,
      currencyConfig: currencyConfig.value,
      histories: ogBundle.value?.histories ?? [],
    }),
  );

  defineReactiveOgImage(
    "Graficos",
    ["title", "lines", "yTicks", "accentColor", "updatedAt", "priceLabel"],
    ogProps,
  );

  const showExchangeBands = computed(() => currency.value === "usd");
  const chart = useChartData(computed(() => currency.value as CurrencyType));

  return {
    currency,
    showExchangeBands,
    ...chart,
  };
}
