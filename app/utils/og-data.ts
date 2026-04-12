import type { ExchangeRate } from "~/lib/types";
import {
  USD_CCL_PROVIDERS,
  BLACKLISTED_PROVIDERS,
} from "~/lib/currencies-config";

export interface OgItem {
  name: string;
  price: string;
}

export function ogUpdatedAtDate(date: Date = new Date()): string {
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function formatARS(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m >= 10 ? Math.round(m) : m.toFixed(1)}M`;
  }
  return `$${Math.round(amount).toLocaleString("es-AR")}`;
}

function isBlacklisted(slug: string): boolean {
  return BLACKLISTED_PROVIDERS.some((p) => slug.toLowerCase() === p);
}

function isCcl(slug: string): boolean {
  return USD_CCL_PROVIDERS.some((p) => slug.toLowerCase() === p);
}

export function shouldOgShowOnly24x7(): boolean {
  const argNow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    }),
  );
  const hours = argNow.getHours();
  const day = argNow.getDay();
  const isWeekend = day === 0 || day === 6;
  return isWeekend || hours < 10 || hours >= 17;
}

export function top3BuyUsd(data: ExchangeRate[], only24x7 = false): OgItem[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        !isCcl(item.slug ?? "") &&
        item.ask > 0 &&
        (!only24x7 || item.is24x7),
    )
    .sort((a, b) => a.ask - b.ask)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.name,
      price: formatARS(item.ask),
    }));
}

export function top3SellUsd(data: ExchangeRate[], only24x7 = false): OgItem[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        !isCcl(item.slug ?? "") &&
        item.bid > 0 &&
        (!only24x7 || item.is24x7),
    )
    .sort((a, b) => b.bid - a.bid)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.name,
      price: formatARS(item.bid),
    }));
}

export function top3BuyUsdCcl(data: ExchangeRate[]): OgItem[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        isCcl(item.slug ?? "") &&
        item.ask > 0,
    )
    .sort((a, b) => a.ask - b.ask)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.name,
      price: formatARS(item.ask),
    }));
}

export function top3SellUsdCcl(data: ExchangeRate[]): OgItem[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        isCcl(item.slug ?? "") &&
        item.bid > 0,
    )
    .sort((a, b) => b.bid - a.bid)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.name,
      price: formatARS(item.bid),
    }));
}

export function top3BuyCrypto(
  data: Array<{ slug: string; prettyName?: string; totalAsk: number }>,
): OgItem[] {
  return data
    .filter((item) => !isBlacklisted(item.slug) && item.totalAsk > 0)
    .sort((a, b) => a.totalAsk - b.totalAsk)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.slug,
      price: formatARS(item.totalAsk),
    }));
}

export function top3SellCrypto(
  data: Array<{ slug: string; prettyName?: string; totalBid: number }>,
): OgItem[] {
  return data
    .filter((item) => !isBlacklisted(item.slug) && item.totalBid > 0)
    .sort((a, b) => b.totalBid - a.totalBid)
    .slice(0, 3)
    .map((item) => ({
      name: item.prettyName || item.slug,
      price: formatARS(item.totalBid),
    }));
}

export interface OgChartLine {
  name: string;
  color: string;
  svgPoints: string;
  currentPrice: string;
}

const CHART_LINE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6"];

export function top3SlugsForBuyUsd(
  data: ExchangeRate[],
  only24x7 = false,
): Array<{ slug: string; name: string }> {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        !isCcl(item.slug ?? "") &&
        item.ask > 0 &&
        (!only24x7 || item.is24x7),
    )
    .sort((a, b) => a.ask - b.ask)
    .slice(0, 3)
    .map((item) => ({ slug: item.slug ?? "", name: item.prettyName || item.name }));
}

export function top3SlugsForBuyUsdCcl(
  data: ExchangeRate[],
): Array<{ slug: string; name: string }> {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        isCcl(item.slug ?? "") &&
        item.ask > 0,
    )
    .sort((a, b) => a.ask - b.ask)
    .slice(0, 3)
    .map((item) => ({ slug: item.slug ?? "", name: item.prettyName || item.name }));
}

export function top3SlugsForBuyCrypto(
  data: Array<{ slug: string; prettyName?: string; totalAsk: number }>,
): Array<{ slug: string; name: string }> {
  return data
    .filter((item) => !isBlacklisted(item.slug) && item.totalAsk > 0)
    .sort((a, b) => a.totalAsk - b.totalAsk)
    .slice(0, 3)
    .map((item) => ({ slug: item.slug, name: item.prettyName || item.slug }));
}

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = arr.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) => arr[Math.round(i * step)]!);
}

export interface OgChartData {
  lines: OgChartLine[];
  /** 3 price labels for grid lines at y=60, 120, 180 (top→bottom) */
  yTicks: string[];
}

export function buildOgChartLines(
  histories: Array<{
    name: string;
    data: Array<{ timestamp: string; ask: number }>;
  }>,
  sinceDate: Date,
  svgWidth = 960,
  svgHeight = 240,
): OgChartData {
  const now = new Date();

  const allFilteredPoints = histories.map((h) =>
    h.data
      .filter((d) => new Date(d.timestamp) >= sinceDate && d.ask > 0)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
  );

  const allValues = allFilteredPoints.flat().map((p) => p.ask);
  if (allValues.length === 0) return { lines: [], yTicks: [] };

  let minVal = Math.min(...allValues);
  let maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || 1;
  minVal -= padding;
  maxVal += padding;
  const valueRange = maxVal - minVal;

  const minTime = sinceDate.getTime();
  const maxTime = now.getTime();
  const timeRange = maxTime - minTime || 1;

  const lines = histories.map((h, i) => {
    const rawPoints = allFilteredPoints[i] ?? [];
    // Extend to fill the full time range with flat segments where data is missing
    const firstPoint = rawPoints[0];
    const lastPoint = rawPoints[rawPoints.length - 1];
    const withLeading =
      firstPoint && new Date(firstPoint.timestamp).getTime() > minTime
        ? [{ timestamp: sinceDate.toISOString(), ask: firstPoint.ask }, ...rawPoints]
        : rawPoints;
    const extendedPoints =
      lastPoint && new Date(lastPoint.timestamp).getTime() < maxTime
        ? [...withLeading, { timestamp: now.toISOString(), ask: lastPoint.ask }]
        : withLeading;
    const points = downsample(extendedPoints, 80);
    const svgPoints = points
      .map((p) => {
        const x =
          ((new Date(p.timestamp).getTime() - minTime) / timeRange) * svgWidth;
        const y = svgHeight - ((p.ask - minVal) / valueRange) * svgHeight;
        return `${Math.round(x)},${Math.round(y)}`;
      })
      .join(" ");

    const lastAsk = rawPoints[rawPoints.length - 1]?.ask ?? 0;
    return {
      name: h.name,
      color: CHART_LINE_COLORS[i] ?? "#10b981",
      svgPoints,
      currentPrice: lastAsk > 0 ? formatARS(lastAsk) : "-",
    };
  });

  // Grid lines at y = svgHeight*0.25, *0.5, *0.75 → values at 75%, 50%, 25% of range
  const yTicks = [0.75, 0.5, 0.25].map((pct) =>
    formatARS(minVal + pct * valueRange),
  );

  return { lines, yTicks };
}

export interface OgTerminalRow {
  name: string;
  buy: string;
  sell: string;
}

export function top5TerminalUsd(
  data: ExchangeRate[],
  only24x7 = false,
): OgTerminalRow[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        !isCcl(item.slug ?? "") &&
        item.ask > 0 &&
        item.bid > 0 &&
        (!only24x7 || item.is24x7),
    )
    .sort((a, b) => a.ask - a.bid - (b.ask - b.bid))
    .slice(0, 5)
    .map((item) => ({
      name: item.prettyName || item.name,
      buy: formatARS(item.ask),
      sell: formatARS(item.bid),
    }));
}

export function top5TerminalUsdCcl(data: ExchangeRate[]): OgTerminalRow[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug ?? "") &&
        isCcl(item.slug ?? "") &&
        item.ask > 0 &&
        item.bid > 0,
    )
    .sort((a, b) => a.ask - a.bid - (b.ask - b.bid))
    .slice(0, 5)
    .map((item) => ({
      name: item.prettyName || item.name,
      buy: formatARS(item.ask),
      sell: formatARS(item.bid),
    }));
}

export function top5TerminalCrypto(
  data: Array<{
    slug: string;
    prettyName?: string;
    totalAsk: number;
    totalBid: number;
  }>,
): OgTerminalRow[] {
  return data
    .filter(
      (item) =>
        !isBlacklisted(item.slug) && item.totalAsk > 0 && item.totalBid > 0,
    )
    .sort((a, b) => a.totalAsk - a.totalBid - (b.totalAsk - b.totalBid))
    .slice(0, 5)
    .map((item) => ({
      name: item.prettyName || item.slug,
      buy: formatARS(item.totalAsk),
      sell: formatARS(item.totalBid),
    }));
}
