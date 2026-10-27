/** Misma ventana que el cron (`STALE_AFTER_MS`). */
export const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export type QuoteFreshness = {
  lastSeenAt?: string | null;
  stale?: boolean;
};

export function isStaleQuote(
  item: QuoteFreshness | null | undefined,
  now = Date.now(),
): boolean {
  if (!item) return false;
  if (item.stale === true) return true;
  if (item.stale === false) return false;
  if (!item.lastSeenAt) return false;
  const ms = Date.parse(item.lastSeenAt);
  if (Number.isNaN(ms)) return false;
  return now - ms >= STALE_AFTER_MS;
}

/** Filtra cotizaciones stale de listados/rankings. Detalle y buscador no usan esto. */
export function withoutStaleQuotes<T extends QuoteFreshness>(
  items: readonly T[] | null | undefined,
  now = Date.now(),
): T[] {
  if (!items) return [];
  return items.filter((item) => !isStaleQuote(item, now));
}

/** Texto para el detalle: "hace 3 horas", "hace 2 días", etc. */
export function formatLastSeenAge(
  lastSeenAt: string | null | undefined,
  now = Date.now(),
): string | null {
  if (!lastSeenAt) return null;
  const ms = Date.parse(lastSeenAt);
  if (Number.isNaN(ms)) return null;
  const delta = Math.max(0, now - ms);
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "hace menos de un minuto";
  if (minutes < 60) {
    return minutes === 1 ? "hace 1 minuto" : `hace ${minutes} minutos`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

export function staleQuoteMessage(
  item: QuoteFreshness | null | undefined,
  now = Date.now(),
): string | null {
  if (!isStaleQuote(item, now)) return null;
  const age = formatLastSeenAge(item?.lastSeenAt, now);
  if (!age) {
    return "Este proveedor no ha reportado un valor nuevo hace más de 12 horas.";
  }
  return `Este proveedor no ha reportado un valor nuevo ${age}. Se sigue mostrando la última cotización conocida.`;
}
