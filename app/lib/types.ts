export interface ExchangeRate {
  slug: string;
  name: string;
  bid: number;
  ask: number;
  logo?: string;
  logoUrl?: string;
  is24x7?: boolean;
  url?: string;
  prettyName?: string;
  pct_variation?: number;
  slowChange?: boolean;
  isBank?: boolean;
  isUsdCcl?: boolean;
}

export interface CryptoRate {
  ask: number;
  totalAsk: number;
  bid: number;
  totalBid: number;
  time: number;
  logo: string;
  prettyName: string;
  url: string;
  slug: string;
}

export interface CryptoRatesResponse {
  [exchangeName: string]: CryptoRate;
}

export interface NormalizedCryptoRate {
  name: string;
  bid: number;
  ask: number;
  logo: string;
  logoUrl: string;
  is24x7: boolean;
  prettyName: string;
  url: string;
  slug: string;
}

export interface ProviderInfo {
  slug: string;
  name: string;
  logoUrl: string;
  is24x7: boolean;
  url: string;
  prettyName: string;
  isBank: boolean;
}

export type CryptoType = "usdc" | "usdt" | "btc" | "eth";

export type CurrencyType = "usd" | "usdc" | "usdt" | "btc" | "eth" | "usd-ccl";

export const API_BASE_URL = "https://api.comparadolar.ar";

export const API_ENDPOINTS = {
  usd: `${API_BASE_URL}/usd`,
  usdc: `${API_BASE_URL}/usdc`,
  usdt: `${API_BASE_URL}/usdt`,
  btc: `${API_BASE_URL}/btc`,
  eth: `${API_BASE_URL}/eth`,
} as const;

export const ASSET_CONFIG = {
  defaultOgImage: "https://i.imgur.com/MSynIzj.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

export const SITE_CONFIG = {
  baseUrl: "https://comparadolar.ar",
  name: "ComparaDólar",
  domain: "comparadolar.ar",
};
