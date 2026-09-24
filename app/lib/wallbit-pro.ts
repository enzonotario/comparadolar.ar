type QuoteSide = "ask" | "bid";

type ComparableQuote = {
  slug: string;
  ask?: number | null;
  bid?: number | null;
};

const WALLBIT_SLUG = "wallbit";
const WALLBIT_PRO_SLUG = "wallbit-pro";

function sameDisplayedPrice(
  left: number | null | undefined,
  right: number | null | undefined,
): boolean {
  if (left == null || right == null || left <= 0 || right <= 0) return false;
  return Math.round(left * 100) === Math.round(right * 100);
}

/**
 * Wallbit Pro repite el precio de Wallbit en un lado y aporta el otro.
 * En Compras a se oculta si el ask coincide. En Vendes a se oculta si el bid coincide.
 */
export function omitDuplicateWallbitPro<T extends ComparableQuote>(
  rates: T[],
  side: QuoteSide,
): T[] {
  const wallbit = rates.find((rate) => rate.slug === WALLBIT_SLUG);
  const wallbitPro = rates.find((rate) => rate.slug === WALLBIT_PRO_SLUG);
  if (!wallbit || !wallbitPro) return rates;
  if (!sameDisplayedPrice(wallbit[side], wallbitPro[side])) return rates;

  return rates.filter((rate) => rate.slug !== WALLBIT_PRO_SLUG);
}
