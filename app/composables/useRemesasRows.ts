import type { ExchangeRate } from "~/lib/types";
import { API_ENDPOINTS } from "~/lib/types";
import { formatCurrency } from "~/lib/utils";
import {
  averageRemesaRating,
  displayCompanyName,
  formatRemesaRating,
  formatRemesaUpdatedAt,
  getInitials,
  getRemesaInstitution,
  getRemesaQuoteMapping,
  getSortableNumericValue,
  isZeroLike,
  type RemesaDetalles,
  type RemesaOption,
  type RemesaQuoteMapping,
} from "~/lib/remesas";

export interface RemesaQuote {
  asset: RemesaQuoteMapping["asset"];
  slug: string;
  prettyName: string;
  bid: number;
  ask: number;
  url?: string;
  logoUrl?: string;
}

export interface RemesaRow extends RemesaOption {
  displayName: string;
  initials: string;
  logo?: string;
  providerUrl?: string;
  averageRating: number;
  averageRatingLabel: string;
  costoRecibirPagosSort: number;
  costoMantenimientoTarjetaSort: number;
  costoTarjetaSort: number;
  retiroArsSort: number;
  monedaLabel: string;
  cuentaPropiaLabel: string;
  inversionesLabel: string;
  tarjetaUsaLabel: string;
  vendesA: number | null;
  vendesALabel: string;
  vendesASort: number;
  vendesAAsset: RemesaQuoteMapping["asset"] | null;
  vendesASlug: string | null;
  vendesAPath: string | null;
  vendesADetail: string | null;
  zeroReceiveCost: boolean;
  zeroArsWithdrawal: boolean;
}

function normalizeUsdQuotes(
  data: ExchangeRate[] | null | undefined,
): RemesaQuote[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.slug && item.bid != null && item.bid > 0)
    .map((item) => ({
      asset: "usd" as const,
      slug: item.slug,
      prettyName: item.prettyName || item.name || item.slug,
      bid: item.bid as number,
      ask: (item.ask as number) ?? 0,
      url: item.url,
      logoUrl: item.logoUrl || item.logo,
    }));
}

function normalizeUsdcQuotes(
  data: Record<string, any> | any[] | null | undefined,
): RemesaQuote[] {
  if (!data) return [];

  const entries = Array.isArray(data)
    ? data.map((item) => [item.slug, item] as const)
    : Object.entries(data);

  return entries
    .map(([key, item]) => {
      const slug = item?.slug ?? key;
      const bid = Number(item?.totalBid ?? item?.bid ?? 0);
      if (!slug || !bid) return null;
      return {
        asset: "usdc" as const,
        slug: String(slug),
        prettyName: item?.prettyName || item?.id || String(slug),
        bid,
        ask: Number(item?.totalAsk ?? item?.ask ?? 0),
        url: item?.url,
        logoUrl: item?.logoUrl || item?.logo,
      } satisfies RemesaQuote;
    })
    .filter((item): item is RemesaQuote => item != null);
}

export async function useRemesasRows() {
  // Llamar ambos useAsyncData antes de cualquier await (contexto Nuxt).
  const remesasAsync = useRemesas();
  const quotesAsync = useAsyncData("remesas-live-quotes", async () => {
    const [usd, usdc] = await Promise.all([
      $fetch<ExchangeRate[]>(API_ENDPOINTS.usd),
      $fetch<Record<string, any> | any[]>(API_ENDPOINTS.usdc),
    ]);
    return [...normalizeUsdQuotes(usd), ...normalizeUsdcQuotes(usdc)];
  });

  const [remesasResult, quotesResult] = await Promise.all([
    remesasAsync,
    quotesAsync,
  ]);

  const remesas = computed<RemesaOption[]>(
    () => remesasResult.data.value?.remesas ?? [],
  );
  const fechaActualizacion = computed(
    () => remesasResult.data.value?.fechaActualizacion ?? null,
  );
  const quotes = computed(() => quotesResult.data.value ?? []);

  const quotesByKey = computed(() => {
    return new Map(
      quotes.value.map(
        (quote) => [`${quote.asset}:${quote.slug}`, quote] as const,
      ),
    );
  });

  const loading = computed(
    () => remesasResult.pending.value || quotesResult.pending.value,
  );
  const remesasError = computed(() => remesasResult.error.value);
  const quotesError = computed(() => quotesResult.error.value);

  const rows = computed<RemesaRow[]>(() => {
    return remesas.value
      .map((item) => {
        const displayName = displayCompanyName(item.compania);
        const institution = getRemesaInstitution(item.compania);
        const mapping = getRemesaQuoteMapping(item.compania);
        const quote = mapping
          ? quotesByKey.value.get(`${mapping.asset}:${mapping.slug}`)
          : undefined;
        const averageRating = averageRemesaRating(item);
        const ratingCount =
          (item.calificacionAndroid !== null ? 1 : 0) +
          (item.calificacionIos !== null ? 1 : 0);
        const vendesA = quote?.bid ?? null;

        return {
          ...item,
          displayName,
          initials: getInitials(displayName),
          logo: quote?.logoUrl || institution?.logo,
          providerUrl: quote?.url || institution?.url,
          averageRating,
          averageRatingLabel:
            ratingCount > 0 ? `${formatRemesaRating(averageRating)}★` : "—",
          costoRecibirPagosSort: getSortableNumericValue(
            item.costoRecibirPagos,
          ),
          costoMantenimientoTarjetaSort: getSortableNumericValue(
            item.costoMantenimientoTarjeta,
          ),
          costoTarjetaSort: getSortableNumericValue(item.costoTarjeta),
          retiroArsSort: getSortableNumericValue(item.retiroArs),
          monedaLabel:
            item.moneda === "FIAT"
              ? "Fiat"
              : item.moneda === "CRIPTO"
                ? "Cripto"
                : item.moneda,
          cuentaPropiaLabel: item.cuentaPropia ? "Sí" : "No",
          inversionesLabel: item.inversiones ? "Sí" : "No",
          tarjetaUsaLabel: item.tarjetaUsa ? "Sí" : "No",
          vendesA,
          vendesALabel: vendesA == null ? "—" : `$${formatCurrency(vendesA)}`,
          vendesASort: vendesA == null ? Number.NEGATIVE_INFINITY : vendesA,
          vendesAAsset: mapping?.asset ?? null,
          vendesASlug: mapping?.slug ?? null,
          vendesAPath: mapping ? `/${mapping.asset}/${mapping.slug}` : null,
          vendesADetail:
            quote && mapping
              ? `${quote.prettyName} · Vendes a $${formatCurrency(quote.bid)} / Compras a $${formatCurrency(quote.ask)} · ${mapping.asset.toUpperCase()}`
              : mapping
                ? "Hoy no hay cotización en vivo para este proveedor"
                : "Sin cotización en ComparaDólar para esta plataforma",
          zeroReceiveCost: isZeroLike(item.costoRecibirPagos),
          zeroArsWithdrawal: isZeroLike(item.retiroArs),
        };
      })
      .filter((row) => row.vendesA != null)
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        if (Number(b.zeroReceiveCost) !== Number(a.zeroReceiveCost)) {
          return Number(b.zeroReceiveCost) - Number(a.zeroReceiveCost);
        }
        return a.displayName.localeCompare(b.displayName);
      });
  });

  const top3 = computed(() => rows.value.slice(0, 3));
  const formattedUpdatedAt = computed(() =>
    formatRemesaUpdatedAt(fechaActualizacion.value),
  );

  return {
    rows,
    top3,
    loading,
    remesasError,
    quotesError,
    fechaActualizacion,
    formattedUpdatedAt,
  };
}

export function getDetail(
  details: RemesaDetalles | null | undefined,
  key: keyof RemesaDetalles,
) {
  return details?.[key] ?? "";
}
