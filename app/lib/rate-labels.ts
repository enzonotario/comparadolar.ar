export const RATE_DISPLAY = {
  ask: {
    label: "Compras a",
    icon: "i-heroicons-arrow-down",
    textClass: "text-green-600",
    darkTextClass: "dark:text-green-400",
    chartColor: "#16a34a",
    chartAreaStart: "rgba(22, 163, 74, 0.3)",
    chartAreaEnd: "rgba(22, 163, 74, 0.05)",
  },
  bid: {
    label: "Vendes a",
    icon: "i-heroicons-arrow-up",
    textClass: "text-red-600",
    darkTextClass: "dark:text-red-400",
    chartColor: "#dc2626",
    chartAreaStart: "rgba(220, 38, 38, 0.3)",
    chartAreaEnd: "rgba(220, 38, 38, 0.05)",
  },
  spread: {
    label: "Spread",
    icon: "i-heroicons-arrows-pointing-out",
    textClass: "text-blue-600",
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
