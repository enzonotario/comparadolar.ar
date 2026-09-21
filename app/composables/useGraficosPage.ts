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
import { defineOgImageWithContext } from "~/utils/reactive-og-image";

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

export async function useGraficosPage() {
  const nuxtApp = useNuxtApp();

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

  const showExchangeBands = computed(() => currency.value === "usd");
  const chart = useChartData(computed(() => currency.value as CurrencyType));

  const { data: ogBundle } = await useAsyncData(
    () => `og-graficos-${currency.value}`,
    async () => {
      const rates = await $fetch<any[]>(`${API_BASE_URL}/${apiCurrency.value}`);
      const top3 = getGraficosTop3Slugs({
        currency: currency.value,
        isCrypto: isCrypto.value,
        isCcl: isCcl.value,
        rates,
      });

      // Prefer compact /trends (7d hourly) over full 90d /history for OG SSR.
      type TrendsPayload = {
        providers?: Record<string, { bid: number[]; ask: number[] }>;
      };
      let trends: TrendsPayload | null = null;
      try {
        trends = await $fetch<TrendsPayload>(
          `${API_BASE_URL}/${apiCurrency.value}/trends`,
        );
      } catch {
        trends = null;
      }

      const now = Date.now();
      const hourMs = 60 * 60 * 1000;

      const histories = top3.map(({ slug, name }) => {
        const series = trends?.providers?.[slug];
        if (!series?.ask?.length) {
          return {
            name,
            data: [] as Array<{ bid: number; ask: number; timestamp: string }>,
          };
        }
        const len = series.ask.length;
        const data = series.ask.map((ask, i) => ({
          ask,
          bid: series.bid?.[i] ?? 0,
          timestamp: new Date(now - (len - 1 - i) * hourMs).toISOString(),
        }));
        return { name, data };
      });

      return { histories };
    },
  );

  defineOgImageWithContext(
    nuxtApp,
    "Graficos",
    buildGraficosOgImage({
      currency: currency.value,
      currencyConfig: currencyConfig.value,
      histories: ogBundle.value?.histories ?? [],
    }),
  );

  return {
    currency,
    showExchangeBands,
    ...chart,
  };
}
