import marketConstants from "../../public/market-constants.json";
import type { CurrencyType, CryptoType } from "./types";

export type ApiCurrencyType = Exclude<CurrencyType, "usd-ccl">;

export const API_CURRENCY_ALIASES =
  marketConstants.apiCurrencyAliases as Partial<
    Record<CurrencyType, ApiCurrencyType>
  >;

export const USD_CCL_PROVIDERS = marketConstants.providerGroups.usdCcl;
export const BLACKLISTED_PROVIDERS = marketConstants.blacklistedProviders;
export const CRYPTO_CURRENCIES = marketConstants.currencyGroups
  .crypto as CryptoType[];
export const FIAT_CURRENCIES = marketConstants.currencyGroups.fiat as Array<
  Extract<CurrencyType, "usd" | "usd-ccl">
>;
export const CURRENCY_LABELS = marketConstants.currencyLabels as Record<
  CurrencyType,
  string
>;

export function toApiCurrency(currency: CurrencyType): ApiCurrencyType;
export function toApiCurrency(currency: string): string;
export function toApiCurrency(
  currency: CurrencyType | string,
): ApiCurrencyType | string {
  return API_CURRENCY_ALIASES[currency as CurrencyType] || currency;
}

export function isCryptoCurrency(currency: string): currency is CryptoType {
  return CRYPTO_CURRENCIES.includes(currency as CryptoType);
}

export function isUsdCclProvider(item: {
  slug?: string;
  name?: string;
}): boolean {
  const slug = item.slug?.toLowerCase() || "";
  const name = item.name?.toLowerCase() || "";
  return USD_CCL_PROVIDERS.some(
    (provider) => slug === provider || name === provider,
  );
}

export function isBlacklistedProviderSlug(item: {
  slug?: string;
  name?: string;
}): boolean {
  const slug = item.slug?.toLowerCase() || "";
  const name = item.name?.toLowerCase() || "";
  return BLACKLISTED_PROVIDERS.some(
    (provider) => slug === provider || name === provider,
  );
}
