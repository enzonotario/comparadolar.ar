import marketConstants from "../../public/market-constants.json";
import type { CurrencyType, CryptoType, UsdFilterCategory, UsdProviderType } from "./types";

export type ApiCurrencyType = Exclude<CurrencyType, "usd-ccl">;

export const API_CURRENCY_ALIASES =
  marketConstants.apiCurrencyAliases as Partial<
    Record<CurrencyType, ApiCurrencyType>
  >;

export const USD_CCL_PROVIDERS = marketConstants.providerGroups.usdCcl;
export const PROVIDER_USD_TYPES = marketConstants.providerUsdTypes as Partial<
  Record<string, UsdProviderType>
>;
export const DEFAULT_USD_PROVIDER_TYPE: UsdProviderType = "Oficial";
export const USD_FILTER_CATEGORIES: UsdFilterCategory[] = [
  "Oficial",
  "MEP",
  "CCL",
  "Cripto",
];
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

function getConfiguredUsdType(item: {
  slug?: string;
  name?: string;
}): UsdProviderType | undefined {
  const slug = item.slug?.toLowerCase() || "";
  const name = item.name?.toLowerCase() || "";

  if (slug && PROVIDER_USD_TYPES[slug]) {
    return PROVIDER_USD_TYPES[slug]!;
  }

  if (name && PROVIDER_USD_TYPES[name]) {
    return PROVIDER_USD_TYPES[name]!;
  }

  return undefined;
}

export function getUsdFilterCategory(item: {
  slug?: string;
  name?: string;
  isUsdCcl?: boolean;
  usdType?: UsdProviderType;
}): UsdFilterCategory {
  if (item.isUsdCcl || isUsdCclProvider(item)) return "CCL";
  return item.usdType ?? getProviderUsdType(item);
}

export function matchesUsdTypeFilter(
  item: {
    slug?: string;
    name?: string;
    isUsdCcl?: boolean;
    usdType?: UsdProviderType;
  },
  enabled: Record<UsdFilterCategory, boolean>,
): boolean {
  return enabled[getUsdFilterCategory(item)];
}

export function getProviderUsdType(item: {
  slug?: string;
  name?: string;
}): UsdProviderType {
  return getConfiguredUsdType(item) ?? DEFAULT_USD_PROVIDER_TYPE;
}

export function hasConfiguredUsdType(item: {
  slug?: string;
  name?: string;
}): boolean {
  return getConfiguredUsdType(item) !== undefined;
}

export function shouldShowUsdTypeBadge(item: {
  slug?: string;
  name?: string;
  usdType?: UsdProviderType;
}): boolean {
  return hasConfiguredUsdType(item);
}

export function getUsdTypeBadgeColor(
  usdType: UsdProviderType,
): "secondary" | "warning" | "neutral" {
  if (usdType === "Cripto") return "secondary";
  if (usdType === "MEP") return "warning";
  return "neutral";
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
