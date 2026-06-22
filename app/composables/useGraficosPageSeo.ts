import type { CurrencyConfig } from "~/lib/currencies-config";
import { SITE_CONFIG, type CurrencyType } from "~/lib/types";
import { RATE_LABELS } from "~/lib/rate-labels";
import {
  top3SlugsForBuyCrypto,
  top3SlugsForBuyUsd,
  top3SlugsForBuyUsdCcl,
  buildOgChartLines,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

export function useGraficosPageSeo(
  currency: Ref<CurrencyType> | ComputedRef<CurrencyType>,
) {
  useSeo({
    title: computed(
      () => `Gráficos ${currency.value.toUpperCase()} | ${SITE_CONFIG.name}`,
    ),
    description: computed(
      () =>
        `Gráficos de ${currency.value.toUpperCase()} en ComparaDólar: histórico, comparación de proveedores y tendencias. Analizá el tipo de cambio en Argentina con datos en tiempo real.`,
    ),
  });
}

export function getGraficosTop3Slugs(options: {
  currency: CurrencyType;
  isCrypto: boolean;
  isCcl: boolean;
  rates: unknown[] | null;
}) {
  const { currency, isCrypto, isCcl, rates } = options;
  if (isCrypto) return top3SlugsForBuyCrypto(rates ?? []);
  if (isCcl) return top3SlugsForBuyUsdCcl(rates ?? []);
  return top3SlugsForBuyUsd(rates ?? [], shouldOgShowOnly24x7());
}

export function buildGraficosOgImage(options: {
  currency: CurrencyType;
  currencyConfig?: CurrencyConfig;
  histories: Array<{ name: string; data: Array<{ bid: number; ask: number; timestamp: string }> }>;
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
