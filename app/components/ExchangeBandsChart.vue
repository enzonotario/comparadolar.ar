<script setup lang="ts">
import {
  areaY,
  colorLegend,
  colorLegendItems,
  d3Curve,
  defineChart,
  dot,
  lineY,
  ruleX,
  text,
} from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { controlledSignal } from "@tanstack/charts/interaction/signal";
import { zoomX } from "@tanstack/charts/interaction/zoom";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { Chart } from "@tanstack/charts/vue";
import { curveMonotoneX } from "d3-shape";
import { scaleUtc } from "d3-scale";
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/types";
import { RATE_DISPLAY, RATE_LABELS } from "@/lib/rate-labels";
import { useZoomPlotHover, useZoomWindow } from "~/lib/charts/shared";

interface Props {
  currency?: CurrencyType;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "usd",
});

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const { showOnly24x7 } = use24x7Filter();
const { matchesFilter: matchesUsdType } = useUsdTypeFilter();

const { data: providersData } = useDataFetching<ExchangeRate[]>(
  API_ENDPOINTS.usd,
);

const topProvidersForBuy = computed(() => {
  if (!providersData.value || !Array.isArray(providersData.value)) {
    return [];
  }

  return [...providersData.value]
    .filter((p) => {
      if (!p.bid || p.bid <= 0 || p.slowChange) return false;
      if (showOnly24x7.value && !p.is24x7) return false;
      if (props.currency === "usd" && !matchesUsdType(p)) return false;
      return true;
    })
    .sort((a, b) => (b.bid || 0) - (a.bid || 0))
    .slice(0, 1)
    .map((p) => ({
      ...p,
      logoUrl: p.logoUrl || p.logo || "/placeholder.svg",
      displayName: p.prettyName || p.name,
    }));
});

const topProvidersForSell = computed(() => {
  if (!providersData.value || !Array.isArray(providersData.value)) {
    return [];
  }

  return [...providersData.value]
    .filter((p) => {
      if (!p.ask || p.ask <= 0 || p.slowChange) return false;
      if (showOnly24x7.value && !p.is24x7) return false;
      if (props.currency === "usd" && !matchesUsdType(p)) return false;
      return true;
    })
    .sort((a, b) => (a.ask || 0) - (b.ask || 0))
    .slice(0, 1)
    .map((p) => ({
      ...p,
      logoUrl: p.logoUrl || p.logo || "/placeholder.svg",
      displayName: p.prettyName || p.name,
    }));
});

interface HistoryItem {
  bid: number;
  ask: number;
  timestamp: string;
}

const providerHistories = ref<Record<string, HistoryItem[]>>({});
const isLoadingHistories = ref(false);

const fetchProviderHistory = async (slug: string) => {
  try {
    const response = await $fetch<HistoryItem[]>(
      `${API_BASE_URL}/usd/providers/${slug}/history`,
    );
    return response;
  } catch {
    return [];
  }
};

watch(
  [topProvidersForBuy, topProvidersForSell],
  async () => {
    if (import.meta.server) return;

    isLoadingHistories.value = true;
    const allProviders = [
      ...topProvidersForBuy.value,
      ...topProvidersForSell.value,
    ];
    const uniqueProviders = Array.from(
      new Map(allProviders.map((p) => [p.slug, p])).values(),
    );

    const histories: Record<string, HistoryItem[]> = {};
    await Promise.all(
      uniqueProviders.map(async (provider) => {
        histories[provider.slug] = await fetchProviderHistory(provider.slug);
      }),
    );

    providerHistories.value = histories;
    isLoadingHistories.value = false;
  },
  { immediate: true },
);

interface InflationItem {
  fecha: string;
  valor: number;
}

const { data: inflationData } = useFetch<InflationItem[]>(
  "https://api.argentinadatos.com/v1/finanzas/indices/inflacion/",
  { server: false, lazy: true },
);

const getInflationForMonth = (year: number, month: number): number => {
  let lookupMonth = month - 2;
  let lookupYear = year;
  if (lookupMonth <= 0) {
    lookupMonth += 12;
    lookupYear -= 1;
  }

  if (!inflationData.value || !Array.isArray(inflationData.value)) {
    return 2.5;
  }

  const match = inflationData.value.find((item) => {
    const date = new Date(item.fecha);
    return (
      date.getFullYear() === lookupYear && date.getMonth() + 1 === lookupMonth
    );
  });

  return match ? match.valor : 2.5;
};

const phase1Start = new Date("2025-04-11");
phase1Start.setHours(0, 0, 0, 0);
const phase1End = new Date("2025-12-31");
phase1End.setHours(0, 0, 0, 0);
const phase1LowerBandStart = 1000;
const phase1UpperBandStart = 1400;
const phase1DailyLowerFactor = Math.pow(0.99, 1 / 30);
const phase1DailyUpperFactor = Math.pow(1.01, 1 / 30);

const bandsData = computed(() => {
  const labels: number[] = [];
  const lower: number[] = [];
  const upper: number[] = [];

  let currentLower = phase1LowerBandStart;
  let currentUpper = phase1UpperBandStart;

  const phase1Days = Math.floor(
    (phase1End.getTime() - phase1Start.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (let i = 0; i <= phase1Days; i++) {
    const currentDate = new Date(phase1Start);
    currentDate.setDate(phase1Start.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    labels.push(currentDate.getTime());
    lower.push(currentLower);
    upper.push(currentUpper);

    currentLower *= phase1DailyLowerFactor;
    currentUpper *= phase1DailyUpperFactor;
  }

  const phase2Start = new Date("2026-01-01");
  phase2Start.setHours(0, 0, 0, 0);
  const now = new Date();
  const phase2End = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  phase2End.setHours(0, 0, 0, 0);

  let currentMonth = phase2Start.getMonth() + 1;
  let currentYear = phase2Start.getFullYear();
  let daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

  let inflationRate = getInflationForMonth(currentYear, currentMonth);
  let dailyLowerFactor = Math.pow(
    1 - inflationRate / 100,
    1 / daysInCurrentMonth,
  );
  let dailyUpperFactor = Math.pow(
    1 + inflationRate / 100,
    1 / daysInCurrentMonth,
  );

  const totalPhase2Days = Math.floor(
    (phase2End.getTime() - phase2Start.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (let i = 0; i <= totalPhase2Days; i++) {
    const currentDate = new Date(phase2Start);
    currentDate.setDate(phase2Start.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    const dateMonth = currentDate.getMonth() + 1;
    const dateYear = currentDate.getFullYear();
    if (dateMonth !== currentMonth || dateYear !== currentYear) {
      currentMonth = dateMonth;
      currentYear = dateYear;
      daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

      inflationRate = getInflationForMonth(currentYear, currentMonth);
      dailyLowerFactor = Math.pow(
        1 - inflationRate / 100,
        1 / daysInCurrentMonth,
      );
      dailyUpperFactor = Math.pow(
        1 + inflationRate / 100,
        1 / daysInCurrentMonth,
      );
    }

    labels.push(currentDate.getTime());
    lower.push(currentLower);
    upper.push(currentUpper);

    currentLower *= dailyLowerFactor;
    currentUpper *= dailyUpperFactor;
  }

  return { labels, lower, upper };
});

const today = new Date();
const todayNormalized = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  0,
  0,
  0,
  0,
);
const todayTimestamp = todayNormalized.getTime();

const todayIndex = computed(() => {
  const labels = bandsData.value.labels;
  if (labels.length === 0) return -1;

  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < labels.length; i++) {
    const diff = Math.abs(labels[i]! - todayTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
});

const getLatestProviderValue = (
  provider: (typeof topProvidersForBuy.value)[0],
  valueType: "bid" | "ask",
): number | null => {
  const history = providerHistories.value[provider.slug] || [];
  const labels = bandsData.value.labels;
  const minTimestamp = labels[0] ?? 0;
  const maxTimestamp = labels[labels.length - 1] ?? 0;

  const filteredHistory = history
    .filter((item) => {
      const itemTimestamp = new Date(item.timestamp).getTime();
      return itemTimestamp >= minTimestamp && itemTimestamp <= maxTimestamp;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  if (filteredHistory.length === 0) {
    const currentValue = valueType === "bid" ? provider.bid : provider.ask;
    return currentValue && currentValue > 0 ? currentValue : null;
  }

  const latestItem = filteredHistory[0];
  if (!latestItem) return null;
  return valueType === "bid" ? latestItem.bid : latestItem.ask;
};

interface ProviderPoint {
  provider: (typeof topProvidersForBuy.value)[0];
  value: number;
  type: "buy" | "sell";
}

const providerPoints = computed<ProviderPoint[]>(() => {
  const points: ProviderPoint[] = [];

  topProvidersForSell.value.forEach((provider) => {
    const value = getLatestProviderValue(provider, "ask");
    if (value == null) return;
    points.push({ provider, value, type: "sell" });
  });

  topProvidersForBuy.value.forEach((provider) => {
    const value = getLatestProviderValue(provider, "bid");
    if (value == null) return;
    points.push({ provider, value, type: "buy" });
  });

  return points.sort((a, b) => a.value - b.value);
});

const yScale = computed(() => {
  const { lower, upper } = bandsData.value;
  const providerValues = providerPoints.value.map((point) => point.value);
  const allValues = [...lower, ...upper, ...providerValues];
  if (allValues.length === 0) {
    return { min: 0, max: 2000 };
  }
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.08;
  return {
    min: Math.max(0, Math.floor(dataMin - padding)),
    max: Math.ceil(dataMax + padding),
  };
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDateLabel = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getImageUrl = (url: string): string => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (import.meta.client && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
};

const smoothCurve = d3Curve(curveMonotoneX);
const { textColor, mutedColor, gridColor } = {
  textColor: computed(() => (isDark.value ? "#f4f4f5" : "#18181b")),
  mutedColor: computed(() => (isDark.value ? "#a1a1aa" : "#71717a")),
  gridColor: computed(() => (isDark.value ? "#3f3f46" : "#e4e4e7")),
};

const bandExtent = computed(() => {
  const labels = bandsData.value.labels;
  const first = labels[0];
  const last = labels[labels.length - 1];
  if (first == null || last == null) return null;
  return [new Date(first), new Date(last)] as const;
});

const zoomWindow = useZoomWindow(bandExtent);

interface BandPoint {
  x: Date;
  lower: number;
  upper: number;
}

interface CalloutPoint {
  x: Date;
  y: number;
  name: string;
  badge: string;
  valueLabel: string;
  detail: string;
  color: string;
  logo: string;
  id: string;
}

const callouts = computed<CalloutPoint[]>(() => {
  const labels = bandsData.value.labels;
  const index = todayIndex.value;
  const timestamp = labels[index];
  if (timestamp == null) return [];

  return providerPoints.value.map((point) => {
    const badge = point.type === "buy" ? RATE_LABELS.bid : RATE_LABELS.ask;
    const color =
      point.type === "buy"
        ? RATE_DISPLAY.bid.chartColor
        : RATE_DISPLAY.ask.chartColor;
    return {
      x: new Date(timestamp),
      y: point.value,
      name: point.provider.displayName,
      badge,
      valueLabel: `$${formatPrice(point.value)}`,
      detail: `${badge} · $${formatPrice(point.value)}`,
      color,
      logo: getImageUrl(point.provider.logoUrl),
      id: `${point.provider.slug}-${point.type}`,
    };
  });
});

const definition = computed(() => {
  const { labels, lower, upper } = bandsData.value;
  const current = zoomWindow.value;
  const dates = bandExtent.value;
  if (!labels.length || !current || !dates) return null;

  const bands: BandPoint[] = labels.map((timestamp, index) => ({
    x: new Date(timestamp),
    lower: lower[index] ?? 0,
    upper: upper[index] ?? 0,
  }));
  const today = callouts.value[0]?.x ?? null;
  const yDomain = scaleLinear().domain([yScale.value.min, yScale.value.max]);

  return defineChart(
    {
      clip: true,
      margin: { top: 36, right: 280 },
      marks: [
        decorative(
          areaY(bands, {
            x: (row: BandPoint) => row.x,
            y1: (row: BandPoint) => row.lower,
            y2: (row: BandPoint) => row.upper,
            fill: "rgba(245, 158, 11, 0.16)",
            curve: smoothCurve,
            key: (row: BandPoint) => row.x.toISOString(),
          }),
        ),
        lineY(bands, {
          x: (row: BandPoint) => row.x,
          y: (row: BandPoint) => row.lower,
          stroke: "#ef4444",
          strokeWidth: 2,
          curve: smoothCurve,
          color: () => "Banda inferior",
          key: (row: BandPoint) => row.x.toISOString(),
        }),
        lineY(bands, {
          x: (row: BandPoint) => row.x,
          y: (row: BandPoint) => row.upper,
          stroke: "#f59e0b",
          strokeWidth: 2,
          curve: smoothCurve,
          color: () => "Banda superior",
          key: (row: BandPoint) => `upper-${row.x.toISOString()}`,
        }),
        ...(today
          ? [
              ruleX([{ x: today }], {
                x: "x",
                stroke: "#10b981",
                strokeDasharray: "4 4",
                strokeWidth: 1.5,
              }),
              decorative(
                text([{ x: today, y: yScale.value.max }], {
                  x: "x",
                  y: "y",
                  text: () => "Hoy",
                  anchor: "middle",
                  dy: 14,
                  fontSize: 12,
                  fontWeight: 700,
                  fill: textColor.value,
                }),
              ),
            ]
          : []),
        ...callouts.value.map((row) =>
          dot([row], {
            x: (point: CalloutPoint) => point.x,
            y: (point: CalloutPoint) => point.y,
            r: 7,
            fill: isDark.value ? "#18181b" : "#ffffff",
            stroke: row.color,
            strokeWidth: 2,
            key: () => row.id,
          }),
        ),
      ],
      scales: {
        x: {
          scale: scaleUtc().domain([current.start, current.end]),
          grid: false,
          axis: {
            ticks: {
              format: (value: Date) =>
                value.toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                }),
            },
            tickLabels: {
              thin: true,
              rotate: -30,
              fontSize: 11,
              fill: mutedColor.value,
            },
          },
        },
        y: {
          scale: yDomain,
          grid: { stroke: gridColor.value },
          axis: {
            label: "Valores de la banda cambiaria",
            ticks: { format: (value: number) => `$${formatPrice(value)}` },
          },
        },
      },
      color: {
        domain: ["Banda inferior", "Banda superior"],
        range: ["#ef4444", "#f59e0b"],
        legend: colorLegend({
          placement: "top",
          items: colorLegendItems({
            indicator: { shape: "line" },
          }),
        }),
      },
      theme: {
        foreground: textColor.value,
        muted: mutedColor.value,
        grid: gridColor.value,
        background: "transparent",
      },
      controls: [
        zoomX({
          window: controlledSignal(current, (next) => {
            zoomWindow.value = { start: next.start, end: next.end };
          }),
          extent: [dates[0], dates[1]],
          ariaLabel: "Período visible de las bandas cambiarias",
          format: (value) => formatDateLabel(value.getTime()),
        }),
      ],
    },
    {
      focus: "nearest-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        portal,
        content: (points) => {
          const focused = points.find((point) => {
            const datum = point.datum as { x?: Date; lower?: number };
            return datum?.x instanceof Date && datum.lower != null;
          });
          const datum = focused?.datum as BandPoint | undefined;
          if (!datum) {
            const callout = points[0]?.datum as CalloutPoint | undefined;
            if (!callout?.name) return { rows: [] };
            return {
              title: formatDateLabel(callout.x.getTime()),
              rows: [
                {
                  label: callout.name,
                  value: callout.detail,
                  color: callout.color,
                },
              ],
            };
          }
          const rows = [
            {
              label: "Banda superior",
              value: `$${formatPrice(datum.upper)}`,
              color: "#f59e0b",
            },
            {
              label: "Banda inferior",
              value: `$${formatPrice(datum.lower)}`,
              color: "#ef4444",
            },
          ];
          if (today && datum.x.getTime() === today.getTime()) {
            for (const callout of callouts.value) {
              rows.push({
                label: callout.name,
                value: callout.detail,
                color: callout.color,
              });
            }
          }
          return { title: formatDateLabel(datum.x.getTime()), rows };
        },
      },
    },
  );
});

const SVG_NS = "http://www.w3.org/2000/svg";
const XHTML_NS = "http://www.w3.org/1999/xhtml";
const LOGO_SIZE = 40;
const LOGO_OFFSET_X = 120;
const LOGO_STACK_GAP = 56;

function paintBandCallouts(svg: SVGSVGElement) {
  svg.querySelectorAll("[data-band-callout]").forEach((node) => node.remove());

  const plot = svg.querySelector<SVGRectElement>(
    'clipPath[id*="ts-chart-clip"] rect',
  );
  if (!plot) return;
  const areaTop = Number(plot.getAttribute("y"));
  const areaBottom = areaTop + Number(plot.getAttribute("height"));
  const circles = [
    ...svg.querySelectorAll<SVGCircleElement>("circle[data-ts-key]"),
  ];

  const markers = callouts.value.flatMap((callout) => {
    const circle = circles.find((node) =>
      node.getAttribute("data-ts-key")?.includes(callout.id),
    );
    if (!circle) return [];
    const plotX = Number(circle.getAttribute("cx"));
    const plotY = Number(circle.getAttribute("cy"));
    if (!Number.isFinite(plotX) || !Number.isFinite(plotY)) return [];
    return [{ ...callout, plotX, plotY, x: plotX + LOGO_OFFSET_X, y: plotY }];
  });
  markers.sort((a, b) => a.y - b.y);

  for (let index = 1; index < markers.length; index++) {
    const previous = markers[index - 1];
    const current = markers[index];
    if (!previous || !current) continue;
    if (current.y - previous.y < LOGO_STACK_GAP) {
      current.y = previous.y + LOGO_STACK_GAP;
    }
  }

  const last = markers[markers.length - 1];
  if (last && last.y + LOGO_SIZE / 2 > areaBottom) {
    const overflow = last.y + LOGO_SIZE / 2 - areaBottom;
    for (const marker of markers) marker.y -= overflow;
  }
  const first = markers[0];
  if (first && first.y - LOGO_SIZE / 2 < areaTop) {
    const shift = areaTop + LOGO_SIZE / 2 - first.y;
    for (const marker of markers) marker.y += shift;
  }

  const layer = document.createElementNS(SVG_NS, "g");
  layer.setAttribute("data-band-callout", "");
  layer.setAttribute("pointer-events", "none");

  for (const marker of markers) {
    const clipId = `band-logo-${marker.id}`;
    const clip = document.createElementNS(SVG_NS, "clipPath");
    clip.setAttribute("id", clipId);
    const clipCircle = document.createElementNS(SVG_NS, "circle");
    clipCircle.setAttribute("cx", String(marker.x));
    clipCircle.setAttribute("cy", String(marker.y));
    clipCircle.setAttribute("r", String(LOGO_SIZE / 2 - 2));
    clip.append(clipCircle);

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", String(marker.plotX + 8));
    line.setAttribute("y1", String(marker.plotY));
    line.setAttribute("x2", String(marker.x - LOGO_SIZE / 2 - 2));
    line.setAttribute("y2", String(marker.y));
    line.setAttribute("stroke", marker.color);
    line.setAttribute("stroke-dasharray", "3 3");
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("opacity", "0.7");

    const frame = document.createElementNS(SVG_NS, "circle");
    frame.setAttribute("cx", String(marker.x));
    frame.setAttribute("cy", String(marker.y));
    frame.setAttribute("r", String(LOGO_SIZE / 2));
    frame.setAttribute("fill", isDark.value ? "#18181b" : "#ffffff");
    frame.setAttribute("stroke", marker.color);
    frame.setAttribute("stroke-width", "2.5");

    const image = document.createElementNS(SVG_NS, "image");
    image.setAttribute("href", marker.logo);
    image.setAttribute("x", String(marker.x - LOGO_SIZE / 2 + 2));
    image.setAttribute("y", String(marker.y - LOGO_SIZE / 2 + 2));
    image.setAttribute("width", String(LOGO_SIZE - 4));
    image.setAttribute("height", String(LOGO_SIZE - 4));
    image.setAttribute("clip-path", `url(#${clipId})`);
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");

    const label = document.createElementNS(SVG_NS, "foreignObject");
    label.setAttribute("x", String(marker.x + LOGO_SIZE / 2 + 6));
    label.setAttribute("y", String(marker.y - 22));
    label.setAttribute("width", "130");
    label.setAttribute("height", "52");
    const card = document.createElementNS(XHTML_NS, "div");
    card.setAttribute(
      "style",
      "display:flex;flex-direction:column;gap:2px;line-height:1.15;font-family:inherit;",
    );
    const badge = document.createElementNS(XHTML_NS, "span");
    badge.textContent = marker.badge;
    badge.setAttribute(
      "style",
      `width:fit-content;border-radius:4px;padding:1px 6px;font-size:9px;font-weight:700;color:#fff;background:${marker.color};`,
    );
    const name = document.createElementNS(XHTML_NS, "span");
    name.textContent = marker.name;
    name.setAttribute(
      "style",
      `overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;color:${textColor.value};`,
    );
    const value = document.createElementNS(XHTML_NS, "span");
    value.textContent = marker.valueLabel;
    value.setAttribute(
      "style",
      `font-size:11px;font-weight:500;color:${marker.color};`,
    );
    card.append(badge, name, value);
    label.append(card);

    layer.append(clip, line, frame, image, label);
  }

  svg.append(layer);
}

const { onRender: onZoomPlotHover } = useZoomPlotHover();

function onRender(context: {
  svg: SVGSVGElement;
  container: HTMLElement;
  interaction: {
    resolvePointer: (clientX: number, clientY: number) => unknown;
    setControlledFocus: (
      target: unknown,
      options?: { source?: "pointer" },
    ) => void;
  };
}) {
  paintBandCallouts(context.svg);
  onZoomPlotHover(context);
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-2">
        <h2 class="text-xl font-bold text-zinc-900 dark:text-white">
          Esquema de Bandas Cambiarias (USD/ARS)
        </h2>
      </div>
    </template>

    <div class="w-full overflow-x-auto">
      <ClientOnly>
        <Chart
          v-if="definition"
          :definition="definition"
          aria-label="Esquema de bandas cambiarias"
          class="h-[500px] w-full"
          :height="500"
          @render="onRender"
        />
        <template #fallback>
          <div
            class="flex h-[500px] w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            Cargando gráfico…
          </div>
        </template>
      </ClientOnly>
    </div>
  </UCard>
</template>
