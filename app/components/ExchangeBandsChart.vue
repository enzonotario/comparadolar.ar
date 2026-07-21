<script setup lang="ts">
import type { VueUiXyConfig, VueUiXyDatasetItem } from "vue-data-ui";
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/types";
import { RATE_DISPLAY, RATE_LABELS } from "@/lib/rate-labels";

const VueUiXy = defineAsyncComponent(() =>
  import("vue-data-ui/vue-ui-xy").then((m) => m.VueUiXy ?? m.default),
);

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

interface ProviderLogoMarker {
  id: string;
  logoUrl: string;
  color: string;
  displayName: string;
  badgeLabel: string;
  valueLabel: string;
  x: number;
  y: number;
  plotX: number;
  plotY: number;
}

const LOGO_SIZE = 40;
const LOGO_OFFSET_X = 120;
const LOGO_STACK_GAP = 56;

const buildProviderLogoMarkers = (svg: {
  data?: Array<{
    id?: string;
    type?: string;
    color?: string;
    name?: string;
    logoUrl?: string;
    displayName?: string;
    badgeLabel?: string;
    plots?: Array<{ x: number; y: number; value: number | null }>;
  }>;
  drawingArea?: {
    right: number;
    left: number;
    top: number;
    bottom: number;
  };
}): ProviderLogoMarker[] => {
  if (!svg?.data?.length) return [];

  const plotSeries = svg.data.filter(
    (serie) => serie.type === "plot" && serie.logoUrl,
  );

  const rawMarkers = plotSeries
    .map((serie) => {
      const plot = serie.plots?.find(
        (item) => item.value != null && Number.isFinite(item.x),
      );
      if (!plot || plot.value == null) return null;

      // Keep a clear gap from the datapoint; draw into the right padding zone.
      const x = plot.x + LOGO_OFFSET_X;

      return {
        id: String(serie.id ?? serie.name),
        logoUrl: getImageUrl(String(serie.logoUrl)),
        color: serie.color || RATE_DISPLAY.ask.chartColor,
        displayName:
          serie.displayName ||
          String(serie.name || "").replace(/\s*\(.*\)$/, ""),
        badgeLabel: serie.badgeLabel || "",
        valueLabel: `$${formatPrice(Number(plot.value))}`,
        x,
        y: plot.y,
        plotX: plot.x,
        plotY: plot.y,
      };
    })
    .filter((marker): marker is ProviderLogoMarker => marker != null)
    .sort((a, b) => a.y - b.y);

  if (rawMarkers.length <= 1) return rawMarkers;

  const areaTop = svg.drawingArea?.top ?? 0;
  const areaBottom = svg.drawingArea?.bottom ?? rawMarkers[0]!.y;
  const stacked = rawMarkers.map((marker) => ({ ...marker }));

  for (let i = 1; i < stacked.length; i++) {
    const prev = stacked[i - 1]!;
    const current = stacked[i]!;
    if (current.y - prev.y < LOGO_STACK_GAP) {
      current.y = prev.y + LOGO_STACK_GAP;
    }
  }

  const last = stacked[stacked.length - 1]!;
  if (last.y + LOGO_SIZE / 2 > areaBottom) {
    const overflow = last.y + LOGO_SIZE / 2 - areaBottom;
    for (const marker of stacked) {
      marker.y -= overflow;
    }
  }

  const first = stacked[0]!;
  if (first.y - LOGO_SIZE / 2 < areaTop) {
    const shift = areaTop + LOGO_SIZE / 2 - first.y;
    for (const marker of stacked) {
      marker.y += shift;
    }
  }

  return stacked;
};

interface ProviderPoint {
  provider: (typeof topProvidersForBuy.value)[0];
  value: number;
  type: "buy" | "sell";
  historyItem?: HistoryItem;
}

const providerPoints = computed<ProviderPoint[]>(() => {
  const points: ProviderPoint[] = [];

  topProvidersForSell.value.forEach((provider) => {
    const value = getLatestProviderValue(provider, "ask");
    if (value == null) return;
    const historyItem = providerHistories.value[provider.slug]?.[0];
    points.push({ provider, value, type: "sell", historyItem });
  });

  topProvidersForBuy.value.forEach((provider) => {
    const value = getLatestProviderValue(provider, "bid");
    if (value == null) return;
    const historyItem = providerHistories.value[provider.slug]?.[0];
    points.push({ provider, value, type: "buy", historyItem });
  });

  return points.sort((a, b) => a.value - b.value);
});

const yScale = computed(() => {
  const { lower, upper } = bandsData.value;
  const providerValues = providerPoints.value.map((p) => p.value);
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

const chartDataset = computed<VueUiXyDatasetItem[]>(() => {
  const { lower, upper, labels } = bandsData.value;
  const pointCount = labels.length;
  const index = todayIndex.value;

  const dataset: VueUiXyDatasetItem[] = [
    {
      name: "Banda inferior",
      type: "line",
      series: lower,
      color: "#ef4444",
      useArea: true,
      smooth: true,
      dataLabels: false,
    },
    {
      name: "Banda superior",
      type: "line",
      series: upper,
      color: "#f59e0b",
      useArea: true,
      smooth: true,
      dataLabels: false,
    },
  ];

  if (index < 0 || pointCount === 0) {
    return dataset;
  }

  providerPoints.value.forEach((point) => {
    const series = Array.from(
      { length: pointCount },
      () => null as number | null,
    );
    series[index] = point.value;

    const label = point.type === "buy" ? RATE_LABELS.bid : RATE_LABELS.ask;
    // buy → Vendes a (bid); sell → Compras a (ask)
    const color =
      point.type === "buy"
        ? RATE_DISPLAY.bid.chartColor
        : RATE_DISPLAY.ask.chartColor;

    dataset.push({
      name: `${point.provider.displayName} (${label})`,
      type: "plot",
      series,
      color,
      useTag: "none",
      showSerieName: undefined,
      dataLabels: false,
      shape: "circle",
      logoUrl: point.provider.logoUrl,
      displayName: point.provider.displayName,
      badgeLabel: label,
      providerType: point.type,
      prefix: "$",
    });
  });

  return dataset;
});

const chartConfig = computed<VueUiXyConfig>(() => {
  const labels = bandsData.value.labels;
  const index = todayIndex.value;
  const textColor = isDark.value ? "#f4f4f5" : "#18181b";
  const mutedColor = isDark.value ? "#a1a1aa" : "#71717a";
  const gridColor = isDark.value ? "#3f3f46" : "#e4e4e7";
  const tooltipBg = isDark.value ? "#000000" : "#ffffff";
  const tooltipBorder = isDark.value
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(0, 0, 0, 0.12)";
  const modulo = Math.max(1, Math.ceil(labels.length / 12));

  return {
    responsive: false,
    loading: isLoadingHistories.value && labels.length === 0,
    downsample: {
      threshold: 2000,
    },
    chart: {
      fontFamily: "inherit",
      backgroundColor: "transparent",
      color: textColor,
      height: 500,
      width: 1120,
      padding: {
        top: 36,
        right: 280,
        bottom: 12,
        left: 8,
      },
      zoom: {
        show: true,
        color: mutedColor,
        highlightColor: textColor,
        enableRangeHandles: true,
        enableSelectionDrag: true,
        minimap: {
          show: true,
          selectedColor: "#10b981",
          selectedColorOpacity: 0.2,
          indicatorColor: textColor,
          lineColor: mutedColor,
          compact: true,
        },
        preview: {
          enable: true,
        },
        useDefaultFormat: false,
        customFormat: ({ absoluteIndex }) => {
          const ts = labels[absoluteIndex];
          return ts ? formatDateLabel(ts) : "";
        },
      },
      highlightArea:
        index >= 0
          ? {
              show: true,
              from: index,
              to: index,
              color: "#10b981",
              opacity: 18,
              caption: {
                text: "Hoy",
                fontSize: 12,
                color: textColor,
                bold: true,
                offsetY: -4,
              },
            }
          : { show: false },
      highlighter: {
        color: textColor,
        opacity: 6,
        useLine: true,
        lineDasharray: 4,
        lineWidth: 1,
      },
      grid: {
        stroke: gridColor,
        showHorizontalLines: true,
        showVerticalLines: false,
        labels: {
          show: true,
          color: textColor,
          fontSize: 12,
          axis: {
            yLabel: "Valores de la banda cambiaria",
            fontSize: 12,
          },
          yAxis: {
            useNiceScale: false,
            commonScaleSteps: 6,
            rounding: 0,
            scaleMin: yScale.value.min,
            scaleMax: yScale.value.max,
            formatter: ({ value }) => `$${formatPrice(value)}`,
          },
          xAxisLabels: {
            show: true,
            color: mutedColor,
            values: labels,
            fontSize: 11,
            showOnlyAtModulo: true,
            modulo,
            datetimeFormatter: {
              enable: true,
              locale: "es",
              options: {
                year: "yyyy",
                month: "MMM yy",
                day: "dd MMM",
              },
            },
            autoRotate: {
              enable: true,
              angle: -30,
            },
          },
        },
      },
      legend: {
        show: true,
        color: textColor,
        fontSize: 13,
        position: "top",
      },
      title: {
        show: false,
      },
      tooltip: {
        show: true,
        color: textColor,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderRadius: 8,
        backgroundOpacity: 82,
        backdropFilter: true,
        roundingValue: 2,
        showPercentage: false,
        showTimeLabel: true,
        useDefaultTimeFormat: false,
        timeFormat: "dd MMM yyyy",
      },
      userOptions: {
        show: false,
      },
    },
    line: {
      strokeWidth: 2,
      useGradient: true,
      labels: {
        show: false,
      },
      area: {
        useGradient: true,
        opacity: 18,
      },
      interLine: {
        pairs: [["Banda inferior", "Banda superior"]],
        colors: [["rgba(239, 68, 68, 0.25)", "rgba(245, 158, 11, 0.25)"]],
        fillOpacity: 0.2,
      },
      dot: {
        hideAboveMaxSerieLength: 1,
        strokeWidth: 0,
      },
      tag: {
        followValue: true,
        fontSize: 12,
        formatter: ({ value }) => `$${formatPrice(value)}`,
      },
    },
    plot: {
      radius: 7,
      useGradient: false,
      labels: {
        show: false,
      },
      tag: {
        followValue: false,
        fontSize: 12,
      },
      dot: {
        useSerieColor: true,
        fill: isDark.value ? "#18181b" : "#ffffff",
        strokeWidth: 2,
      },
    },
  };
});

interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

interface TooltipContent {
  timeString: string;
  bandas: TooltipRow[];
  compras: TooltipRow[];
  ventas: TooltipRow[];
}

const buildTooltipContent = (payload: {
  datapoint?: unknown;
  absoluteIndex?: number;
  timeLabel?: { text?: string; absoluteIndex?: number };
}): TooltipContent => {
  const labels = bandsData.value.labels;
  const absoluteIndex =
    typeof payload.absoluteIndex === "number"
      ? payload.absoluteIndex
      : payload.timeLabel?.absoluteIndex;
  const ts =
    typeof absoluteIndex === "number" ? labels[absoluteIndex] : undefined;
  const timeString = ts
    ? formatDateLabel(ts)
    : payload.timeLabel?.text || formatDateLabel(todayTimestamp);

  const bandas: TooltipRow[] = [];
  const compras: TooltipRow[] = [];
  const ventas: TooltipRow[] = [];
  const items = Array.isArray(payload.datapoint)
    ? payload.datapoint
    : payload.datapoint
      ? [payload.datapoint]
      : [];

  items.forEach((item: any) => {
    const name = item?.name ?? "";
    const value =
      item?.value ??
      item?.absoluteValue ??
      (typeof item?.y === "number" ? item.y : null);
    if (value == null || Number.isNaN(Number(value))) return;

    const entry = {
      name,
      value: Number(value),
      color: item?.color ?? "#888",
    };

    if (name === "Banda superior" || name === "Banda inferior") {
      bandas.push(entry);
    } else if (name.includes(RATE_LABELS.ask)) {
      compras.push(entry);
    } else if (name.includes(RATE_LABELS.bid)) {
      ventas.push(entry);
    }
  });

  bandas.sort((a, b) =>
    a.name === "Banda superior" ? -1 : b.name === "Banda superior" ? 1 : 0,
  );
  compras.sort((a, b) => a.value - b.value);
  ventas.sort((a, b) => b.value - a.value);

  return { timeString, bandas, compras, ventas };
};
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
        <VueUiXy :dataset="chartDataset" :config="chartConfig">
          <template #tooltip="tooltipProps">
            <div
              v-for="content in [buildTooltipContent(tooltipProps)]"
              :key="content.timeString"
              class="min-w-[180px] text-sm leading-snug"
            >
              <div class="mb-1.5 font-semibold">
                {{ content.timeString }}
              </div>

              <div
                v-for="item in content.bandas"
                :key="`band-${item.name}`"
                class="flex items-center gap-1.5"
              >
                <span :style="{ color: item.color }">●</span>
                <span>{{ item.name }}: ${{ formatPrice(item.value) }}</span>
              </div>

              <template v-if="content.compras.length">
                <div class="mt-2 font-semibold">{{ RATE_LABELS.ask }}:</div>
                <div
                  v-for="item in content.compras"
                  :key="`ask-${item.name}`"
                  class="flex items-center gap-1.5"
                >
                  <span :style="{ color: item.color }">●</span>
                  <span
                    >{{ item.name.replace(` (${RATE_LABELS.ask})`, "") }}: ${{
                      formatPrice(item.value)
                    }}</span
                  >
                </div>
              </template>

              <template v-if="content.ventas.length">
                <div class="mt-2 font-semibold">{{ RATE_LABELS.bid }}:</div>
                <div
                  v-for="item in content.ventas"
                  :key="`bid-${item.name}`"
                  class="flex items-center gap-1.5"
                >
                  <span :style="{ color: item.color }">●</span>
                  <span
                    >{{ item.name.replace(` (${RATE_LABELS.bid})`, "") }}: ${{
                      formatPrice(item.value)
                    }}</span
                  >
                </div>
              </template>
            </div>
          </template>

          <template #svg="{ svg }">
            <g
              v-for="marker in buildProviderLogoMarkers(svg)"
              :key="marker.id"
              class="pointer-events-none"
            >
              <defs>
                <clipPath :id="`provider-logo-clip-${marker.id}`">
                  <circle
                    :cx="marker.x"
                    :cy="marker.y"
                    :r="LOGO_SIZE / 2 - 2"
                  />
                </clipPath>
              </defs>

              <line
                :x1="marker.plotX + 8"
                :y1="marker.plotY"
                :x2="marker.x - LOGO_SIZE / 2 - 2"
                :y2="marker.y"
                :stroke="marker.color"
                stroke-width="1.5"
                stroke-dasharray="3 3"
                opacity="0.7"
              />

              <circle
                :cx="marker.x"
                :cy="marker.y"
                :r="LOGO_SIZE / 2"
                :fill="isDark ? '#18181b' : '#ffffff'"
                :stroke="marker.color"
                stroke-width="2.5"
              />

              <image
                :href="marker.logoUrl"
                :x="marker.x - LOGO_SIZE / 2 + 2"
                :y="marker.y - LOGO_SIZE / 2 + 2"
                :width="LOGO_SIZE - 4"
                :height="LOGO_SIZE - 4"
                :clip-path="`url(#provider-logo-clip-${marker.id})`"
                preserveAspectRatio="xMidYMid slice"
              />

              <foreignObject
                :x="marker.x + LOGO_SIZE / 2 + 6"
                :y="marker.y - 22"
                width="120"
                height="44"
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  class="flex flex-col gap-0.5 leading-tight"
                >
                  <span
                    class="w-fit rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                    :style="{ backgroundColor: marker.color }"
                  >
                    {{ marker.badgeLabel }}
                  </span>
                  <span
                    class="truncate text-[11px] font-semibold"
                    :style="{ color: isDark ? '#f4f4f5' : '#18181b' }"
                  >
                    {{ marker.displayName }}
                  </span>
                  <span
                    class="text-[11px] font-medium"
                    :style="{ color: marker.color }"
                  >
                    {{ marker.valueLabel }}
                  </span>
                </div>
              </foreignObject>
            </g>
          </template>
        </VueUiXy>
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
