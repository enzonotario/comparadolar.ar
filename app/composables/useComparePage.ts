import { getCurrencyConfig } from "~/lib/currencies-config";
import {
  API_BASE_URL,
  SITE_CONFIG,
  type CurrencyType,
  type ExchangeRate,
} from "~/lib/types";
import { isCryptoCurrency, toApiCurrency } from "~/lib/market-constants";
import {
  top3BuyCrypto,
  top3BuyUsd,
  top3BuyUsdCcl,
  top3SellCrypto,
  top3SellUsd,
  top3SellUsdCcl,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

type CompareOgRates = ExchangeRate[] | Array<{
  slug: string;
  prettyName?: string;
  totalAsk: number;
  totalBid: number;
}>;

interface ComparePageSeoOptions {
  currency: CurrencyType;
  title?: string;
  structuredDataType?: "WebPage" | "FinancialProduct";
}

export function getCompareHomeTitle() {
  return `${SITE_CONFIG.name} | Cotizaciones del dólar en tiempo real`;
}

export function buildCompareOgImage(
  currency: CurrencyType,
  rates: CompareOgRates,
) {
  const currencyConfig = getCurrencyConfig(currency);
  const isCrypto = isCryptoCurrency(currency);
  const isCcl = currency === "usd-ccl";

  if (isCrypto) {
    return {
      title: `Compará ${currencyConfig?.fullName ?? currency.toUpperCase()}`,
      buy: top3BuyCrypto(rates as never),
      sell: top3SellCrypto(rates as never),
      updatedAt: ogUpdatedAtDate(),
      accentColor: currencyConfig?.gradientColors.from,
    };
  }

  if (isCcl) {
    return {
      title: "Compará Dólar CCL",
      buy: top3BuyUsdCcl(rates as ExchangeRate[]),
      sell: top3SellUsdCcl(rates as ExchangeRate[]),
      updatedAt: ogUpdatedAtDate(),
      accentColor: currencyConfig?.gradientColors.from ?? "#3b82f6",
    };
  }

  const only24x7 = shouldOgShowOnly24x7();

  return {
    title: "Compará Dólar",
    buy: top3BuyUsd(rates as ExchangeRate[], only24x7),
    sell: top3SellUsd(rates as ExchangeRate[], only24x7),
    updatedAt: ogUpdatedAtDate(),
    accentColor: currencyConfig?.gradientColors.from ?? "#10b981",
  };
}

function useComparePageSeo({
  currency,
  title,
  structuredDataType,
}: ComparePageSeoOptions) {
  useSeo({
    currency,
    ...(title ? { title } : {}),
  });

  useStructuredData({
    currency,
    type:
      structuredDataType ??
      (isCryptoCurrency(currency) ? "FinancialProduct" : "WebPage"),
  });
}

function useCompareOgImage(currency: MaybeRef<CurrencyType>) {
  const resolvedCurrency = computed(() => toValue(currency));

  const { data: ogData } = useAsyncData(
    computed(() => `og-${resolvedCurrency.value}`),
    () =>
      $fetch<CompareOgRates>(
        `${API_BASE_URL}/${toApiCurrency(resolvedCurrency.value)}`,
      ),
  );

  const ogProps = computed(() =>
    buildCompareOgImage(resolvedCurrency.value, ogData.value ?? []),
  );

  defineReactiveOgImage(
    "ComparaDolar",
    ["title", "buy", "sell", "updatedAt", "accentColor"],
    ogProps,
  );
}

export function useCompareFiatPage(options: {
  currency: CurrencyType;
  title?: string;
  show24x7Filter?: boolean;
}) {
  useComparePageSeo({
    currency: options.currency,
    title: options.title,
    structuredDataType: "WebPage",
  });
  useCompareOgImage(options.currency);

  const showOnly24x7 = options.show24x7Filter
    ? use24x7Filter().showOnly24x7
    : undefined;

  return {
    currency: options.currency,
    showOnly24x7,
  };
}

export function useCompareCryptoPage() {
  const { currency, apiCurrency } = useValidatedRouteCurrency();

  useComparePageSeo({
    currency: currency.value,
    structuredDataType: "FinancialProduct",
  });
  useCompareOgImage(currency);

  return { currency, apiCurrency };
}
