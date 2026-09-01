import type { ExchangeRate } from "./types";
import { getProviderDisplayName } from "./provider-display";

type RateWithQuotes = Pick<
  ExchangeRate,
  "ask" | "bid" | "slug" | "name" | "prettyName"
>;

export function getExchangeSpreadAbs(rate: RateWithQuotes): number {
  const { ask, bid } = rate;
  if (ask == null || bid == null || ask <= 0 || bid <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return ask - bid;
}

function compareByName(a: RateWithQuotes, b: RateWithQuotes): number {
  return getProviderDisplayName(a).localeCompare(
    getProviderDisplayName(b),
    "es",
    { sensitivity: "base" },
  );
}

function compareBySpreadThenName(a: RateWithQuotes, b: RateWithQuotes): number {
  const spreadDiff = getExchangeSpreadAbs(a) - getExchangeSpreadAbs(b);
  if (spreadDiff !== 0) return spreadDiff;
  return compareByName(a, b);
}

function comparePrices(
  aPrice: number | null | undefined,
  bPrice: number | null | undefined,
  desc: boolean,
): number {
  const aValid = aPrice != null && aPrice > 0;
  const bValid = bPrice != null && bPrice > 0;

  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;
  if (aPrice === bPrice) return 0;

  return desc ? bPrice! - aPrice! : aPrice! - bPrice!;
}

export function compareExchangeRatesForBuy(
  a: RateWithQuotes,
  b: RateWithQuotes,
): number {
  const priceCmp = comparePrices(a.ask, b.ask, false);
  if (priceCmp !== 0) return priceCmp;
  return compareBySpreadThenName(a, b);
}

export function compareExchangeRatesForSell(
  a: RateWithQuotes,
  b: RateWithQuotes,
): number {
  const priceCmp = comparePrices(a.bid, b.bid, true);
  if (priceCmp !== 0) return priceCmp;
  return compareBySpreadThenName(a, b);
}

export function compareExchangeRatesByPrice(
  a: RateWithQuotes,
  b: RateWithQuotes,
  side: "ask" | "bid",
  desc: boolean,
): number {
  const aPrice = side === "ask" ? a.ask : a.bid;
  const bPrice = side === "ask" ? b.ask : b.bid;
  const priceCmp = comparePrices(aPrice, bPrice, desc);
  if (priceCmp !== 0) return priceCmp;
  return compareBySpreadThenName(a, b);
}

export function compareExchangeRatesBySpread(
  a: RateWithQuotes,
  b: RateWithQuotes,
  desc: boolean,
): number {
  const spreadCmp = getExchangeSpreadAbs(a) - getExchangeSpreadAbs(b);
  if (spreadCmp !== 0) return desc ? -spreadCmp : spreadCmp;
  return compareByName(a, b);
}
