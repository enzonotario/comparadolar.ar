export const RATE_LABELS = {
  bid: "Vendes a",
  ask: "Compras a",
  spread: "Spread",
} as const;

export const RATE_LABELS_UPPER = {
  bid: RATE_LABELS.bid.toUpperCase(),
  ask: RATE_LABELS.ask.toUpperCase(),
  spread: RATE_LABELS.spread.toUpperCase(),
} as const;
