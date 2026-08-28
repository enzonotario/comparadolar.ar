export const RATE_DISPLAY = {
  ask: {
    label: "Compras a",
    icon: "i-heroicons-arrow-down",
    textClass: "text-green-700",
    darkTextClass: "dark:text-green-400",
    chartColor: "#15803d",
    chartAreaStart: "rgba(21, 128, 61, 0.3)",
    chartAreaEnd: "rgba(21, 128, 61, 0.05)",
  },
  bid: {
    label: "Vendes a",
    icon: "i-heroicons-arrow-up",
    textClass: "text-red-700",
    darkTextClass: "dark:text-red-400",
    chartColor: "#b91c1c",
    chartAreaStart: "rgba(185, 28, 28, 0.3)",
    chartAreaEnd: "rgba(185, 28, 28, 0.05)",
  },
  spread: {
    label: "Spread",
    icon: "i-heroicons-arrows-pointing-out",
    textClass: "text-blue-700",
    darkTextClass: "dark:text-blue-400",
  },
} as const;

export const RATE_LABELS = {
  bid: RATE_DISPLAY.bid.label,
  ask: RATE_DISPLAY.ask.label,
  spread: RATE_DISPLAY.spread.label,
} as const;

export const RATE_LABELS_UPPER = {
  bid: RATE_LABELS.bid.toUpperCase(),
  ask: RATE_LABELS.ask.toUpperCase(),
  spread: RATE_LABELS.spread.toUpperCase(),
} as const;
