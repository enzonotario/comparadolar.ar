import type { CurrencyConfig } from "~/lib/currencies-config";
import { SITE_CONFIG, type CurrencyType } from "~/lib/types";
import {
  top5TerminalCrypto,
  top5TerminalUsd,
  top5TerminalUsdCcl,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

export function useTerminalPageSeo(
  currency: Ref<CurrencyType> | ComputedRef<CurrencyType>,
) {
  useSeo({
    title: computed(
      () => `Terminal ${currency.value.toUpperCase()} | ${SITE_CONFIG.name}`,
    ),
    description: computed(
      () =>
        `Terminal ${currency.value.toUpperCase()} en ComparaDólar: cotizaciones en vivo, tabla compacta y exportación CSV. Compará compra, venta y spread entre proveedores sin distracciones.`,
    ),
  });
}

export function buildTerminalOgImage(options: {
  currency: CurrencyType;
  currencyConfig?: CurrencyConfig;
  isCcl: boolean;
  isFiat: boolean;
  data: unknown[] | null;
}) {
  const { currency, currencyConfig, isCcl, isFiat, data } = options;
  const rates = data ?? [];

  let rows;
  if (isCcl) rows = top5TerminalUsdCcl(rates as never);
  else if (isFiat) rows = top5TerminalUsd(rates as never, shouldOgShowOnly24x7());
  else rows = top5TerminalCrypto(rates as never);

  return {
    title: currencyConfig?.label ?? currency.toUpperCase(),
    rows,
    updatedAt: ogUpdatedAtDate(),
    accentColor: currencyConfig?.gradientColors.from ?? "#10b981",
  };
}
