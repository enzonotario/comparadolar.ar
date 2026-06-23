import type { CurrencyConfig } from "~/lib/currencies-config";
import { API_BASE_URL, SITE_CONFIG, type CurrencyType } from "~/lib/types";
import {
  top5TerminalCrypto,
  top5TerminalUsd,
  top5TerminalUsdCcl,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

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
  else if (isFiat) {
    rows = top5TerminalUsd(rates as never, shouldOgShowOnly24x7());
  } else rows = top5TerminalCrypto(rates as never);

  return {
    title: currencyConfig?.label ?? currency.toUpperCase(),
    rows,
    updatedAt: ogUpdatedAtDate(),
    accentColor: currencyConfig?.gradientColors.from ?? "#10b981",
  };
}

export function useTerminalPage(notFoundMessage = "Moneda no encontrada") {
  definePageMeta({
    layout: "minimal",
  });

  const routeContext = useValidatedRouteCurrency(notFoundMessage);
  const { currency, currencyConfig, isCcl, isFiat } = routeContext;

  useSeo({
    title: computed(
      () => `Terminal ${currency.value.toUpperCase()} | ${SITE_CONFIG.name}`,
    ),
    description: computed(
      () =>
        `Terminal ${currency.value.toUpperCase()} en ComparaDólar: cotizaciones en vivo, tabla compacta y exportación CSV. Compará compra, venta y spread entre proveedores sin distracciones.`,
    ),
  });

  const { data: ogData } = useAsyncData(
    computed(() => `og-terminal-${currency.value}`),
    () => {
      if (isFiat.value) {
        return $fetch(`${API_BASE_URL}/usd`);
      }
      return $fetch(`${API_BASE_URL}/${currency.value}`);
    },
  );

  const ogProps = computed(() =>
    buildTerminalOgImage({
      currency: currency.value,
      currencyConfig: currencyConfig.value,
      isCcl: isCcl.value,
      isFiat: isFiat.value,
      data: ogData.value ?? [],
    }),
  );

  defineReactiveOgImage(
    "Terminal",
    ["title", "rows", "updatedAt", "accentColor"],
    ogProps,
  );

  const { terminalColors } = useTerminalColors(currency);
  const terminalTableRef = ref();
  const providerCount = computed(
    () => terminalTableRef.value?.filteredRates?.length || 0,
  );
  const isLoading = computed(
    () => terminalTableRef.value?.isLoading ?? true,
  );

  return {
    currency,
    terminalColors,
    terminalTableRef,
    providerCount,
    isLoading,
  };
}
