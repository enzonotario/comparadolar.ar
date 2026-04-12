export function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateSpread(ask: number, bid: number): number {
  if (ask === 0 || bid === 0) return 0;
  return ((ask - bid) / bid) * 100;
}
