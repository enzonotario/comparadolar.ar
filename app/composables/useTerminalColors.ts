import type { CurrencyType } from "@/lib/types";
import { getCurrencyColorScheme } from "@/lib/currencies-config";

export function useTerminalColors(currency: Ref<CurrencyType> | CurrencyType) {
  const colorMode = useColorMode();
  const currencyValue = unref(currency);
  const colorScheme = getCurrencyColorScheme(currencyValue);

  const terminalColors = computed(() => {
    const isDark = colorMode.value === "dark";

    const colorMap = {
      green: {
        text: isDark ? "text-green-400" : "text-green-600",
        textSecondary: isDark ? "text-green-500" : "text-green-700",
        tableBorder: isDark ? "border-green-800" : "border-green-300",
        tableHover: isDark ? "hover:bg-green-900/10" : "hover:bg-green-50",
        cellText: isDark ? "text-green-100" : "text-gray-800",
        cellTextYellow: isDark ? "text-yellow-400" : "text-yellow-600",
        blue: isDark ? "text-blue-400/70" : "text-blue-600",
        ring: isDark ? "ring-green-400/50" : "ring-green-500",
      },
      cyan: {
        text: isDark ? "text-cyan-400" : "text-cyan-600",
        textSecondary: isDark ? "text-cyan-500" : "text-cyan-700",
        tableBorder: isDark ? "border-cyan-800" : "border-cyan-300",
        tableHover: isDark ? "hover:bg-cyan-900/10" : "hover:bg-cyan-50",
        cellText: isDark ? "text-cyan-100" : "text-gray-800",
        cellTextYellow: isDark ? "text-yellow-400" : "text-yellow-600",
        blue: isDark ? "text-blue-400/70" : "text-blue-600",
        ring: isDark ? "ring-cyan-400/50" : "ring-cyan-500",
      },
      teal: {
        text: isDark ? "text-teal-400" : "text-teal-600",
        textSecondary: isDark ? "text-teal-500" : "text-teal-700",
        tableBorder: isDark ? "border-teal-800" : "border-teal-300",
        tableHover: isDark ? "hover:bg-teal-900/10" : "hover:bg-teal-50",
        cellText: isDark ? "text-teal-100" : "text-gray-800",
        cellTextYellow: isDark ? "text-yellow-400" : "text-yellow-600",
        blue: isDark ? "text-blue-400/70" : "text-blue-600",
        ring: isDark ? "ring-teal-400/50" : "ring-teal-500",
      },
      orange: {
        text: isDark ? "text-orange-400" : "text-orange-600",
        textSecondary: isDark ? "text-orange-500" : "text-orange-700",
        tableBorder: isDark ? "border-orange-800" : "border-orange-300",
        tableHover: isDark ? "hover:bg-orange-900/10" : "hover:bg-orange-50",
        cellText: isDark ? "text-orange-100" : "text-gray-800",
        cellTextYellow: isDark ? "text-yellow-400" : "text-yellow-600",
        blue: isDark ? "text-blue-400/70" : "text-blue-600",
        ring: isDark ? "ring-orange-400/50" : "ring-orange-500",
      },
      violet: {
        text: isDark ? "text-violet-400" : "text-violet-600",
        textSecondary: isDark ? "text-violet-500" : "text-violet-700",
        tableBorder: isDark ? "border-violet-800" : "border-violet-300",
        tableHover: isDark ? "hover:bg-violet-900/10" : "hover:bg-violet-50",
        cellText: isDark ? "text-violet-100" : "text-gray-800",
        cellTextYellow: isDark ? "text-yellow-400" : "text-yellow-600",
        blue: isDark ? "text-blue-400/70" : "text-blue-600",
        ring: isDark ? "ring-violet-400/50" : "ring-violet-500",
      },
    };

    return colorMap[colorScheme as keyof typeof colorMap] || colorMap.green;
  });

  return {
    terminalColors,
    colorScheme,
  };
}
