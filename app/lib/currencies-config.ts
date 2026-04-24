import type { CurrencyType } from "./types";

export const USD_CCL_PROVIDERS = [
  "astropay",
  "global66",
  "wallbit",
  "plus-crypto",
];

export const BLACKLISTED_PROVIDERS = ["brubank"];

export function isBlacklistedProvider(item: {
  slug?: string;
  name?: string;
}): boolean {
  const slug = item.slug?.toLowerCase() || "";
  const name = item.name?.toLowerCase() || "";
  return BLACKLISTED_PROVIDERS.some(
    (provider) => slug === provider || name === provider,
  );
}

export interface CurrencyConfig {
  value: CurrencyType;
  label: string;
  fullName: string;
  icon: string;
  route: string;
  colorScheme: "green" | "cyan" | "teal" | "orange" | "violet";
  gradientColors: {
    from: string;
    to: string;
  };
  description: string;
  keywords: string[];
}

export const currenciesConfig: Record<CurrencyType, CurrencyConfig> = {
  usd: {
    value: "usd",
    label: "USD",
    fullName: "Dólar",
    icon: "i-heroicons-currency-dollar",
    route: "/",
    colorScheme: "green",
    gradientColors: {
      from: "#10b981", // emerald-500
      to: "#059669", // emerald-600
    },
    description:
      "Compará dólar en Argentina al instante: compra, venta, spread y ranking entre proveedores. ComparaDólar reúne bancos y casas de cambio para la mejor cotización.",
    keywords: [
      "dolar",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
    ],
  },
  "usd-ccl": {
    value: "usd-ccl",
    label: "USD CCL",
    fullName: "Dólar CCL",
    icon: "i-heroicons-building-library",
    route: "/usd-ccl",
    colorScheme: "green",
    gradientColors: {
      from: "#3b82f6",
      to: "#2563eb",
    },
    description:
      "Dólar CCL en vivo: cotizaciones de brokers y apps con compra, venta y spread. ComparaDólar compara contado con liquidación para operar mejor en Argentina.",
    keywords: [
      "dolar ccl",
      "ccl",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
    ],
  },
  usdc: {
    value: "usdc",
    label: "USDC",
    fullName: "USDC",
    icon: "i-cryptocurrency-color:usdc",
    route: "/usdc",
    colorScheme: "cyan",
    gradientColors: {
      from: "#06b6d4", // cyan-500
      to: "#0891b2", // cyan-600
    },
    description:
      "USDC en pesos: exchanges y apps con cotización al instante y spread claro. ComparaDólar reúne tasas para operar stablecoin al mejor precio en Argentina.",
    keywords: [
      "usdc",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
      "crypto",
    ],
  },
  usdt: {
    value: "usdt",
    label: "USDT",
    fullName: "USDT",
    icon: "i-cryptocurrency-color:usdt",
    route: "/usdt",
    colorScheme: "teal",
    gradientColors: {
      from: "#14b8a6", // teal-500
      to: "#0d9488", // teal-600
    },
    description:
      "USDT en pesos: precios compra/venta en vivo entre proveedores y spread visible. ComparaDólar ayuda a elegir dónde operar tether con datos claros.",
    keywords: [
      "usdt",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
      "crypto",
    ],
  },
  btc: {
    value: "btc",
    label: "BTC",
    fullName: "Bitcoin",
    icon: "i-logos-bitcoin",
    route: "/btc",
    colorScheme: "orange",
    gradientColors: {
      from: "#f59e0b", // amber-500
      to: "#d97706", // amber-600
    },
    description:
      "Bitcoin en pesos: cotizaciones de exchanges y apps locales al instante. ComparaDólar muestra compra, venta y spread para comparar antes de operar.",
    keywords: [
      "bitcoin",
      "btc",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
      "crypto",
    ],
  },
  eth: {
    value: "eth",
    label: "ETH",
    fullName: "Ethereum",
    icon: "i-token-branded:ethereum",
    route: "/eth",
    colorScheme: "violet",
    gradientColors: {
      from: "#8b5cf6", // violet-500
      to: "#7c3aed", // violet-600
    },
    description:
      "Ethereum en pesos: precios en vivo y diferencia compra/venta entre apps. ComparaDólar ofrece una vista clara del mercado local antes de operar ETH.",
    keywords: [
      "ethereum",
      "eth",
      "cotizaciones",
      "argentina",
      "tipo de cambio",
      "comparador",
      "crypto",
    ],
  },
};

export const currencies = Object.values(currenciesConfig);

export const validCurrencies: CurrencyType[] = [
  "usd",
  "usd-ccl",
  "usdc",
  "usdt",
  "btc",
  "eth",
];

export function getCurrencyConfig(
  currency: CurrencyType | string,
): CurrencyConfig | undefined {
  return currenciesConfig[currency as CurrencyType];
}

export function getCurrencyColorScheme(
  currency: CurrencyType | string,
): string {
  return getCurrencyConfig(currency)?.colorScheme || "green";
}

export function getCurrencyRoute(currency: CurrencyType | string): string {
  return getCurrencyConfig(currency)?.route || "/";
}

export function getCurrencyGradient(currency: CurrencyType | string): string {
  const config = getCurrencyConfig(currency);
  if (!config) return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  return `linear-gradient(135deg, ${config.gradientColors.from} 0%, ${config.gradientColors.to} 100%)`;
}

export function isValidCurrency(currency: string): currency is CurrencyType {
  return validCurrencies.includes(currency as CurrencyType);
}
