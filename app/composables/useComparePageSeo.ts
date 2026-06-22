import { getCurrencyConfig } from "~/lib/currencies-config";
import { SITE_CONFIG, type CurrencyType, type ExchangeRate } from "~/lib/types";
import { isCryptoCurrency } from "~/lib/market-constants";
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

interface UseComparePageSeoOptions {
  currency: CurrencyType;
  title?: string;
  structuredDataType?: "WebPage" | "FinancialProduct";
}

export function useComparePageSeo({
  currency,
  title,
  structuredDataType,
}: UseComparePageSeoOptions) {
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

export function getCompareHomeTitle() {
  return `${SITE_CONFIG.name} | Cotizaciones del dólar en tiempo real`;
}

type CompareOgRates = ExchangeRate[] | Array<{
  slug: string;
  prettyName?: string;
  totalAsk: number;
  totalBid: number;
}>;

export function buildCompareOgImage(currency: CurrencyType, rates: CompareOgRates) {
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
