import type { CurrencyType } from "~/lib/types";

export interface RemesaDetalles {
  cuentaPropia?: string;
  inversiones?: string;
  tarjetaUsa?: string;
  costoRecibirPagos?: string;
  costoMantenimientoTarjeta?: string;
  costoTarjeta?: string;
  retiroArs?: string;
}

export interface RemesaOption {
  compania: string;
  cuentaPropia: boolean;
  moneda: "FIAT" | "CRIPTO" | string;
  inversiones: boolean;
  tarjetaUsa: boolean;
  costoRecibirPagos: string | null;
  costoMantenimientoTarjeta: string | null;
  costoTarjeta: string | null;
  retiroArs: string | null;
  detalles?: RemesaDetalles | null;
  calificacionAndroid: number | null;
  calificacionIos: number | null;
}

export interface RemesasResponse {
  fechaActualizacion: string;
  remesas: RemesaOption[];
}

export interface RemesaQuoteMapping {
  asset: Extract<CurrencyType, "usd" | "usdc">;
  slug: string;
}

export interface RemesaInstitutionMeta {
  displayName: string;
  logo?: string;
  url?: string;
}

const COMPANY_DISPLAY_NAMES: Record<string, string> = {
  wallbit: "Wallbit",
  arq: "ARQ",
  astropay: "AstroPay",
  cocos: "Cocos",
  grabrfi: "GrabrFi",
  takenos: "Takenos",
  payoneer: "Payoneer",
  airtm: "Airtm",
  lemon: "Lemon",
  wise: "Wise",
  global66: "Global66",
  belo: "Belo",
  ripio: "Ripio",
};

/** Mapeo remesa → cotización ComparaDolar para la columna "Vendes a". */
export const REMESA_QUOTE_MAP: Record<string, RemesaQuoteMapping> = {
  wallbit: { asset: "usd", slug: "wallbit" },
  astropay: { asset: "usd", slug: "astropay" },
  cocos: { asset: "usd", slug: "cocos" },
  global66: { asset: "usd", slug: "global66" },
  takenos: { asset: "usd", slug: "takenos" },
  arq: { asset: "usdc", slug: "arq" },
  lemon: { asset: "usdc", slug: "lemoncash" },
  belo: { asset: "usdc", slug: "belo" },
  ripio: { asset: "usdc", slug: "ripio" },
};

const REMESA_INSTITUTIONS: Record<string, RemesaInstitutionMeta> = {
  wallbit: {
    displayName: "Wallbit",
    logo: "https://api.argentinadatos.com/static/logos/wallbit.png",
    url: "https://www.wallbit.io/en?ref=comparadolar",
  },
  astropay: {
    displayName: "AstroPay",
    logo: "https://api.argentinadatos.com/static/logos/astropay.png",
    url: "https://www.astropay.com/?ref=comparadolar",
  },
  cocos: {
    displayName: "Cocos",
    logo: "https://api.argentinadatos.com/static/logos/cocos.png",
    url: "https://cocos.capital/?ref=comparadolar",
  },
  global66: {
    displayName: "Global66",
    logo: "https://api.argentinadatos.com/static/logos/global66.svg",
    url: "https://share.global66.com/COMPARADOLAR?ref=comparadolar",
  },
  takenos: {
    displayName: "Takenos",
    logo: "https://api.argentinadatos.com/static/logos/takenos.svg",
    url: "https://www.takenos.com/?ref=comparadolar",
  },
  arq: {
    displayName: "ARQ",
    logo: "https://api.argentinadatos.com/static/logos/arq.png",
    url: "https://arqfinance.com/?ref=comparadolar",
  },
  lemon: {
    displayName: "Lemon",
    logo: "https://api.argentinadatos.com/static/logos/lemon.png",
    url: "https://lemon.me/?ref=comparadolar",
  },
  belo: {
    displayName: "Belo",
    logo: "https://api.argentinadatos.com/static/logos/belo.png",
    url: "https://simple.belo.app/app/referral?referralCode=FERMINR1&useMarket=true&ref=comparadolar",
  },
  ripio: {
    displayName: "Ripio",
    logo: "https://api.argentinadatos.com/static/logos/ripio.png",
    url: "https://auth.ripio.com/?ref=comparadolar#/register/",
  },
  airtm: {
    displayName: "Airtm",
    logo: "https://api.argentinadatos.com/static/logos/airtm.svg",
    url: "https://www.airtm.com/?ref=comparadolar",
  },
  grabrfi: {
    displayName: "GrabrFi",
    logo: "https://api.argentinadatos.com/static/logos/grabr.svg",
    url: "https://grabrfi.com/?ref=comparadolar",
  },
  payoneer: {
    displayName: "Payoneer",
    logo: "https://api.argentinadatos.com/static/logos/payoneer.svg",
    url: "https://www.payoneer.com/?ref=comparadolar",
  },
  wise: {
    displayName: "Wise",
    logo: "https://api.argentinadatos.com/static/logos/wise.svg",
    url: "https://wise.com/?ref=comparadolar",
  },
};

export function normalizeProviderKey(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "");
}

export function displayCompanyName(compania: string): string {
  const key = normalizeProviderKey(compania);
  const mapped =
    COMPANY_DISPLAY_NAMES[key] || REMESA_INSTITUTIONS[key]?.displayName;
  if (mapped) return mapped;

  return compania
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getRemesaInstitution(
  compania: string,
): RemesaInstitutionMeta | null {
  return REMESA_INSTITUTIONS[normalizeProviderKey(compania)] ?? null;
}

export function getRemesaQuoteMapping(
  compania: string,
): RemesaQuoteMapping | null {
  return REMESA_QUOTE_MAP[normalizeProviderKey(compania)] ?? null;
}

export function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
}

export function isZeroLike(value: string | null): boolean {
  if (!value) return false;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(",", ".");
  return ["0", "0%", "0usd", "0ars", "$0", "0.0", "0.00"].includes(normalized);
}

export function hasPositiveNumericValue(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return false;
  return Number(match[0]) > 0;
}

export function getSortableNumericValue(value: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY;
  if (isZeroLike(value)) return 0;

  const normalized = value.trim().toLowerCase().replace(",", ".");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return Number.POSITIVE_INFINITY;

  return Number(match[0]);
}

export function formatRemesaRating(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRemesaUpdatedAt(value: string | null): string {
  if (!value) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date());
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

export function averageRemesaRating(item: RemesaOption): number {
  const androidRating = item.calificacionAndroid ?? 0;
  const iosRating = item.calificacionIos ?? 0;
  const ratingCount =
    (item.calificacionAndroid !== null ? 1 : 0) +
    (item.calificacionIos !== null ? 1 : 0);
  return ratingCount > 0 ? (androidRating + iosRating) / ratingCount : 0;
}
