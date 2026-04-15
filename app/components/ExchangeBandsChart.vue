<script setup lang="ts">
import { provide, onMounted, nextTick, ref as vueRef } from "vue";
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/types";

interface Props {
  currency?: CurrencyType;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "usd",
});

const colorMode = computed(() => useColorMode().value);

provide(THEME_KEY, colorMode);

const { showOnly24x7 } = use24x7Filter();

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
      if (props.currency === "usd-ccl") {
        if (!p.isUsdCcl) return false;
      } else {
        if (p.isUsdCcl) return false;
      }
      return true;
    })
    .sort((a, b) => (b.bid || 0) - (a.bid || 0))
    .slice(0, 3)
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
      if (props.currency === "usd-ccl") {
        if (!p.isUsdCcl) return false;
      } else {
        if (p.isUsdCcl) return false;
      }
      return true;
    })
    .sort((a, b) => (a.ask || 0) - (b.ask || 0))
    .slice(0, 3)
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

const getLatestProviderValue = (
  provider: (typeof topProvidersForBuy.value)[0],
  valueType: "bid" | "ask",
  minTimestamp: number,
  maxTimestamp: number,
): [number, number] | null => {
  const history = providerHistories.value[provider.slug] || [];

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
    if (currentValue && currentValue > 0) {
      return [todayTimestamp, currentValue];
    }
    return null;
  }

  const latestItem = filteredHistory[0];
  if (!latestItem) {
    return null;
  }
  const timestamp = new Date(latestItem.timestamp).getTime();
  const value = valueType === "bid" ? latestItem.bid : latestItem.ask;

  return [timestamp, value];
};

const renderer = ref<"svg" | "canvas">("svg");
const initOptions = computed(() => ({
  height: 500,
  width: "auto",
  renderer: renderer.value as "svg" | "canvas",
}));
provide(INIT_OPTIONS_KEY, initOptions);

// Inflation data fetch
interface InflationItem {
  fecha: string;
  valor: number;
}

const { data: inflationData } = useFetch<InflationItem[]>(
  "https://api.argentinadatos.com/v1/finanzas/indices/inflacion/",
);

const getInflationForMonth = (year: number, month: number): number => {
  // Look up inflation from 2 months prior (publication lag)
  let lookupMonth = month - 2;
  let lookupYear = year;
  if (lookupMonth <= 0) {
    lookupMonth += 12;
    lookupYear -= 1;
  }

  if (!inflationData.value || !Array.isArray(inflationData.value)) {
    return 2.5; // Fallback
  }

  const match = inflationData.value.find((item) => {
    const date = new Date(item.fecha);
    return (
      date.getFullYear() === lookupYear && date.getMonth() + 1 === lookupMonth
    );
  });

  return match ? match.valor : 2.5; // Fallback to 2.5% if data unavailable
};

// Phase 1 constants (Apr 11, 2025 → Dec 31, 2025)
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
  const lower: Array<[number, number]> = [];
  const upper: Array<[number, number]> = [];

  let currentLower = phase1LowerBandStart;
  let currentUpper = phase1UpperBandStart;

  // Phase 1: Apr 11, 2025 → Dec 31, 2025 (fixed ±1%/month)
  const phase1Days = Math.floor(
    (phase1End.getTime() - phase1Start.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (let i = 0; i <= phase1Days; i++) {
    const currentDate = new Date(phase1Start);
    currentDate.setDate(phase1Start.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);
    const timestamp = currentDate.getTime();

    labels.push(timestamp);
    lower.push([timestamp, currentLower]);
    upper.push([timestamp, currentUpper]);

    currentLower *= phase1DailyLowerFactor;
    currentUpper *= phase1DailyUpperFactor;
  }

  // Phase 2: Jan 1, 2026 → end of current month (inflation-based rates)
  const phase2Start = new Date("2026-01-01");
  phase2Start.setHours(0, 0, 0, 0);
  const now = new Date();
  const phase2End = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  phase2End.setHours(0, 0, 0, 0);

  let currentMonth = phase2Start.getMonth() + 1; // 1-indexed
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
    const timestamp = currentDate.getTime();

    // Check if we've moved to a new month
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

    labels.push(timestamp);
    lower.push([timestamp, currentLower]);
    upper.push([timestamp, currentUpper]);

    currentLower *= dailyLowerFactor;
    currentUpper *= dailyUpperFactor;
  }

  return { labels, lowerBandData: lower, upperBandData: upper };
});

const lowerBandData = computed(() => bandsData.value.lowerBandData);
const upperBandData = computed(() => bandsData.value.upperBandData);

const minY = computed(() => Math.min(...lowerBandData.value.map((d) => d[1])));
const maxY = computed(() => Math.max(...upperBandData.value.map((d) => d[1])));

const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDay = today.getDate();
const todayNormalized = new Date(todayYear, todayMonth, todayDay, 0, 0, 0, 0);
const todayTimestamp = todayNormalized.getTime();

const minTimestamp = computed(() => lowerBandData.value[0]?.[0] ?? 0);
const maxTimestamp = computed(
  () => lowerBandData.value[lowerBandData.value.length - 1]?.[0] ?? 0,
);

const initialRange = computed(() => {
  const referenceDate =
    todayTimestamp >= minTimestamp.value ? todayTimestamp : minTimestamp.value;

  const threeMonthsBefore = new Date(referenceDate);
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
  threeMonthsBefore.setHours(0, 0, 0, 0);

  const threeMonthsAfter = new Date(referenceDate);
  threeMonthsAfter.setMonth(threeMonthsAfter.getMonth() + 3);
  threeMonthsAfter.setHours(23, 59, 59, 999);

  const initialMin = Math.max(minTimestamp.value, threeMonthsBefore.getTime());
  const initialMax = Math.min(maxTimestamp.value, threeMonthsAfter.getTime());

  return { min: initialMin, max: initialMax };
});

const visibleRange = ref<{ min: number; max: number }>({ min: 0, max: 0 });
watch(
  initialRange,
  (val) => {
    visibleRange.value = val;
  },
  { immediate: true },
);

const visibleYRange = ref<{ min: number; max: number } | null>(null);

const chartRef = vueRef<any>(null);

const setInitialZoom = () => {
  try {
    const chart =
      chartRef.value?.chart ||
      chartRef.value?.getEchartsInstance?.() ||
      (chartRef.value as any)?.__echarts_instance__;
    if (chart) {
      chart.dispatchAction({
        type: "dataZoom",
        dataZoomIndex: 2,
        xAxisIndex: 0,
        startValue: initialRange.value.min,
        endValue: initialRange.value.max,
      });

      return true;
    }
  } catch {
    // chartRef may be null or not initialized
  }
  return false;
};

const setInitialYZoom = () => {
  try {
    const chart =
      chartRef.value?.chart ||
      chartRef.value?.getEchartsInstance?.() ||
      (chartRef.value as any)?.__echarts_instance__;
    if (chart) {
      const allProviders = [
        ...topProvidersForBuy.value,
        ...topProvidersForSell.value,
      ];
      const allValues: number[] = [];

      allProviders.forEach((provider) => {
        if (provider.bid && provider.bid > 0) allValues.push(provider.bid);
        if (provider.ask && provider.ask > 0) allValues.push(provider.ask);
      });

      if (allValues.length > 0) {
        const providerAvg =
          allValues.reduce((a, b) => a + b, 0) / allValues.length;
        const providerMin = Math.min(...allValues);
        const providerMax = Math.max(...allValues);
        const providerRange = providerMax - providerMin;
        const margin = Math.max(providerRange * 0.2, 50);

        const yMin = Math.max(minY.value, providerAvg - margin);
        const yMax = Math.min(maxY.value, providerAvg + margin);

        chart.dispatchAction({
          type: "dataZoom",
          dataZoomIndex: 3,
          yAxisIndex: 0,
          startValue: yMin,
          endValue: yMax,
        });

        visibleYRange.value = { min: yMin, max: yMax };

        return true;
      }
    }
  } catch {
    // chart instance might be unavailable
  }
  return false;
};

onMounted(async () => {
  await nextTick();
  const attempts = [100, 300, 500, 1000];
  for (const delay of attempts) {
    setTimeout(() => {
      setInitialZoom();
      setInitialYZoom();
    }, delay);
  }
});

watch(
  [topProvidersForBuy, topProvidersForSell, providerHistories],
  () => {
    if (
      topProvidersForBuy.value.length > 0 ||
      topProvidersForSell.value.length > 0
    ) {
      nextTick(() => {
        setInitialYZoom();
      });
    }
  },
  { immediate: false },
);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const getImageUrl = (url: string): string => {
  if (!url) return "/placeholder.svg";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (import.meta.client && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return url;
};

const handleDataZoom = (params: any) => {
  const events = Array.isArray(params) ? params : [params];

  events.forEach((event: any) => {
    const isYAxis = event.dataZoomIndex === 1 || event.dataZoomIndex === 3;

    if (isYAxis) {
      if (event.start !== undefined && event.end !== undefined) {
        const rangeStart =
          minY.value + (maxY.value - minY.value) * (event.start / 100);
        const rangeEnd =
          minY.value + (maxY.value - minY.value) * (event.end / 100);
        visibleYRange.value = { min: rangeStart, max: rangeEnd };
      } else if (event.batch && event.batch[0]) {
        const zoomData = event.batch[0];
        if (zoomData.start !== undefined && zoomData.end !== undefined) {
          const rangeStart =
            minY.value + (maxY.value - minY.value) * (zoomData.start / 100);
          const rangeEnd =
            minY.value + (maxY.value - minY.value) * (zoomData.end / 100);
          visibleYRange.value = { min: rangeStart, max: rangeEnd };
        }
      }
    } else {
      if (event.start !== undefined && event.end !== undefined) {
        const rangeStart =
          minTimestamp.value +
          (maxTimestamp.value - minTimestamp.value) * (event.start / 100);
        const rangeEnd =
          minTimestamp.value +
          (maxTimestamp.value - minTimestamp.value) * (event.end / 100);
        visibleRange.value = { min: rangeStart, max: rangeEnd };
      } else if (event.batch && event.batch[0]) {
        const zoomData = event.batch[0];
        if (zoomData.start !== undefined && zoomData.end !== undefined) {
          const rangeStart =
            minTimestamp.value +
            (maxTimestamp.value - minTimestamp.value) * (zoomData.start / 100);
          const rangeEnd =
            minTimestamp.value +
            (maxTimestamp.value - minTimestamp.value) * (zoomData.end / 100);
          visibleRange.value = { min: rangeStart, max: rangeEnd };
        }
      }
    }
  });

  nextTick(() => {
    try {
      const chart =
        chartRef.value?.chart ||
        chartRef.value?.getEchartsInstance?.() ||
        (chartRef.value as any)?.__echarts_instance__;
      if (chart) {
        const yAxisModel = chart.getModel().getComponent("yAxis", 0);
        if (yAxisModel) {
          const scale = yAxisModel.axis.scale;
          if (scale && scale._extent) {
            visibleYRange.value = {
              min: scale._extent[0],
              max: scale._extent[1],
            };
          }
        }
      }
    } catch {
      // chart instance might be unavailable
    }
  });
};

const chartOption = computed(() => {
  const showTodayIndicator =
    todayTimestamp >= minTimestamp.value &&
    todayTimestamp <= maxTimestamp.value;

  interface ProviderDataPoint {
    provider: (typeof topProvidersForBuy.value)[0];
    value: number;
    timestamp: number;
    type: "buy" | "sell";
    historyItem?: HistoryItem;
  }

  const allProviderPoints: ProviderDataPoint[] = [];

  topProvidersForBuy.value.forEach((provider) => {
    const latestValue = getLatestProviderValue(
      provider,
      "bid",
      minTimestamp.value,
      maxTimestamp.value,
    );
    if (latestValue) {
      const [timestamp, value] = latestValue;
      const historyItem =
        providerHistories.value[provider.slug]?.find(
          (item) => new Date(item.timestamp).getTime() === timestamp,
        ) || providerHistories.value[provider.slug]?.[0];
      allProviderPoints.push({
        provider,
        value,
        timestamp,
        type: "buy",
        historyItem,
      });
    }
  });

  topProvidersForSell.value.forEach((provider) => {
    const latestValue = getLatestProviderValue(
      provider,
      "ask",
      minTimestamp.value,
      maxTimestamp.value,
    );
    if (latestValue) {
      const [timestamp, value] = latestValue;
      const historyItem =
        providerHistories.value[provider.slug]?.find(
          (item) => new Date(item.timestamp).getTime() === timestamp,
        ) || providerHistories.value[provider.slug]?.[0];
      allProviderPoints.push({
        provider,
        value,
        timestamp,
        type: "sell",
        historyItem,
      });
    }
  });

  allProviderPoints.sort((a, b) => a.value - b.value);

  const providerSeries: any[] = [];
  if (showTodayIndicator && allProviderPoints.length > 0) {
    const currentYRange = visibleYRange.value || {
      min: minY.value,
      max: maxY.value,
    };
    const rangeY = currentYRange.max - currentYRange.min;
    const spacing = rangeY / (allProviderPoints.length + 1);

    const currentRange = visibleRange.value || {
      min: minTimestamp.value,
      max: maxTimestamp.value,
    };
    const visibleRangeX = currentRange.max - currentRange.min;
    const todayInRange =
      todayTimestamp >= currentRange.min && todayTimestamp <= currentRange.max;
    const logoXPosition = todayInRange
      ? todayTimestamp + visibleRangeX * 0.05
      : currentRange.max - visibleRangeX * 0.1;

    allProviderPoints.forEach((point, index) => {
      const currentYRange = visibleYRange.value || {
        min: minY.value,
        max: maxY.value,
      };
      const logoVerticalPosition = currentYRange.min + spacing * (index + 1);
      const actualValue = point.value;

      const color = point.type === "buy" ? "#10b981" : "#ef4444";

      providerSeries.push({
        name: `${point.provider.displayName} (${point.type === "buy" ? "Compra" : "Venta"}) - Punto`,
        type: "scatter" as const,
        data: [[todayTimestamp, actualValue]],
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: color,
          borderColor: "#fff",
          borderWidth: 2,
        },
        z: 180,
        silent: false,
        tooltip: {
          formatter: (_params: any) => {
            const date = new Date(todayTimestamp);
            const timeString = date.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            if (point.type === "buy") {
              return (
                `<strong>${point.provider.displayName}</strong><br/>` +
                `<strong>${timeString}</strong><br/>` +
                `Compra (Bid): $${formatPrice(actualValue)}<br/>` +
                `Venta (Ask): $${formatPrice(point.historyItem?.ask || point.provider.ask || 0)}`
              );
            } else {
              return (
                `<strong>${point.provider.displayName}</strong><br/>` +
                `<strong>${timeString}</strong><br/>` +
                `Compra (Bid): $${formatPrice(point.historyItem?.bid || point.provider.bid || 0)}<br/>` +
                `Venta (Ask): $${formatPrice(actualValue)}`
              );
            }
          },
        },
      });

      providerSeries.push({
        name: `${point.provider.displayName} (${point.type === "buy" ? "Compra" : "Venta"}) - Línea`,
        type: "line" as const,
        data: [
          [todayTimestamp, actualValue],
          [logoXPosition, logoVerticalPosition],
        ],
        lineStyle: {
          color,
          width: 1.5,
          type: "solid",
          opacity: 0.6,
        },
        symbol: "none",
        z: 150,
        silent: true,
      });

      const badgeText = point.type === "buy" ? "Vendes a" : "Compras a";
      const badgeBgColor = point.type === "buy" ? "#10b981" : "#ef4444";

      providerSeries.push({
        name: `${point.provider.displayName} (${badgeText})`,
        type: "scatter" as const,
        data: [[logoXPosition, logoVerticalPosition]],
        symbol: `image://${getImageUrl(point.provider.logoUrl)}`,
        symbolSize: 40,
        itemStyle: {
          borderColor: color,
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "right",
          formatter: `{badge|${badgeText}}\n${point.provider.displayName}\n$${formatPrice(actualValue)}`,
          rich: {
            badge: {
              backgroundColor: badgeBgColor,
              color: "#fff",
              padding: [2, 6],
              borderRadius: 3,
              fontSize: 9,
              fontWeight: "bold",
            },
          },
          color: colorMode.value === "dark" ? "#fff" : "#000",
          fontSize: 11,
          backgroundColor:
            colorMode.value === "dark"
              ? "rgba(0, 0, 0, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          padding: [4, 6],
          borderRadius: 4,
          borderColor: color,
          borderWidth: 1,
        },
        tooltip: {
          formatter: (_params: any) => {
            const date = new Date(todayTimestamp);
            const timeString = date.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            if (point.type === "buy") {
              return (
                `<strong>${point.provider.displayName}</strong><br/>` +
                `<strong>${timeString}</strong><br/>` +
                `Compra (Bid): $${formatPrice(actualValue)}<br/>` +
                `Venta (Ask): $${formatPrice(point.historyItem?.ask || point.provider.ask || 0)}`
              );
            } else {
              return (
                `<strong>${point.provider.displayName}</strong><br/>` +
                `<strong>${timeString}</strong><br/>` +
                `Compra (Bid): $${formatPrice(point.historyItem?.bid || point.provider.bid || 0)}<br/>` +
                `Venta (Ask): $${formatPrice(actualValue)}`
              );
            }
          },
        },
        z: 200,
      });
    });
  }

  const legendData = ["Banda inferior", "Banda superior"];

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor:
        colorMode.value === "dark"
          ? "rgba(0, 0, 0, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
      borderColor: colorMode.value === "dark" ? "#666" : "#ccc",
      textStyle: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
      },
      formatter: (params: any) => {
        // Separar bandas y proveedores primero para detectar si hay proveedores
        const bandas: any[] = [];
        const vendesA: any[] = [];
        const comprasA: any[] = [];

        params.forEach((item: any) => {
          if (
            item.seriesName === "Banda superior" ||
            item.seriesName === "Banda inferior"
          ) {
            bandas.push(item);
          } else if (item.seriesName?.includes("Vendes a")) {
            vendesA.push(item);
          } else if (item.seriesName?.includes("Compras a")) {
            comprasA.push(item);
          }
        });

        // Si hay proveedores en el hover, siempre usar todayTimestamp
        const hasProviders = vendesA.length > 0 || comprasA.length > 0;
        let timestamp = params[0].axisValue || params[0].data[0];

        if (hasProviders) {
          // Si hay proveedores, siempre usar la fecha de hoy
          timestamp = todayTimestamp;
        } else {
          // Si el hover está cerca de la línea "Hoy" (dentro de 1 día), usar todayTimestamp
          const hoverTimestamp =
            typeof timestamp === "number"
              ? timestamp
              : new Date(timestamp).getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
          if (Math.abs(hoverTimestamp - todayTimestamp) < oneDayInMs) {
            timestamp = todayTimestamp;
          }
        }

        const date =
          typeof timestamp === "number"
            ? new Date(timestamp)
            : new Date(timestamp);
        const timeString = date.toLocaleDateString("es-AR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Ordenar bandas: superior primero, luego inferior
        bandas.sort((a: any, b: any) => {
          if (a.seriesName === "Banda superior") return -1;
          if (b.seriesName === "Banda superior") return 1;
          return 0;
        });

        // Ordenar "Vendes a" de mayor a menor valor
        vendesA.sort((a: any, b: any) => {
          const valueA = a.data?.[1] ?? a.value?.[1] ?? 0;
          const valueB = b.data?.[1] ?? b.value?.[1] ?? 0;
          return valueB - valueA; // Mayor a menor
        });

        // Ordenar "Compras a" de menor a mayor valor
        comprasA.sort((a: any, b: any) => {
          const valueA = a.data?.[1] || a.value?.[1] || 0;
          const valueB = b.data?.[1] || b.value?.[1] || 0;
          return valueA - valueB; // Menor a mayor
        });

        // Construir el tooltip
        let tooltip = `<strong>${timeString}</strong><br/>`;

        // Mostrar bandas primero
        bandas.forEach((item: any) => {
          tooltip += `${item.marker} ${item.seriesName}: $${formatPrice(
            item.data[1],
          )}<br/>`;
        });

        // Mostrar "Vendes a" ordenados de mayor a menor
        if (vendesA.length > 0) {
          tooltip += `<br/><strong>Vendes a:</strong><br/>`;
          vendesA.forEach((item: any) => {
            // Obtener el valor del punto scatter (puede estar en data[1] o value[1])
            const value =
              item.data?.[1] ??
              item.value?.[1] ??
              (Array.isArray(item.data) ? item.data[1] : item.data);
            const providerName =
              item.seriesName?.replace(" (Vendes a)", "") ||
              item.seriesName ||
              "";
            tooltip += `${item.marker || "•"} ${providerName}: $${formatPrice(value)}<br/>`;
          });
        }

        // Mostrar "Compras a" ordenados de menor a mayor
        if (comprasA.length > 0) {
          tooltip += `<br/><strong>Compras a:</strong><br/>`;
          comprasA.forEach((item: any) => {
            // Obtener el valor del punto scatter (puede estar en data[1] o value[1])
            const value =
              item.data?.[1] ??
              item.value?.[1] ??
              (Array.isArray(item.data) ? item.data[1] : item.data);
            const providerName =
              item.seriesName?.replace(" (Compras a)", "") ||
              item.seriesName ||
              "";
            tooltip += `${item.marker || "•"} ${providerName}: $${formatPrice(value)}<br/>`;
          });
        }

        return tooltip;
      },
    },
    legend: {
      data: legendData,
      top: 10,
      textStyle: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
      },
      selectedMode: false,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "15%",
      outerBoundsMode: "same",
      outerBoundsContain: "axisLabel",
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      min: minTimestamp.value,
      // Extender el max para incluir los logos cuando se hace zoom
      max: (() => {
        if (showTodayIndicator && allProviderPoints.length > 0) {
          const currentRange = visibleRange.value || initialRange.value;
          const visibleRangeX = currentRange.max - currentRange.min;
          const todayInRange =
            todayTimestamp >= currentRange.min &&
            todayTimestamp <= currentRange.max;
          const logoXPosition = todayInRange
            ? todayTimestamp + visibleRangeX * 0.05
            : currentRange.max - visibleRangeX * 0.1;
          // Asegurar que el max incluya los logos
          return Math.max(
            maxTimestamp.value,
            logoXPosition + visibleRangeX * 0.1,
          );
        }
        return maxTimestamp.value;
      })(),
      nameTextStyle: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
      },
      axisLabel: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
        formatter: (value: number | string) => {
          const date =
            typeof value === "string" ? new Date(value) : new Date(value);

          // Si tenemos información del rango visible, ajustar la granularidad
          if (visibleRange.value) {
            const rangeDiff = visibleRange.value.max - visibleRange.value.min;
            const daysInRange = rangeDiff / (1000 * 60 * 60 * 24);

            // Si el rango visible es menor a 90 días, mostrar día/mes
            if (daysInRange < 90) {
              return date.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
              });
            }
          }

          // Por defecto, mostrar mes/año
          return date.toLocaleDateString("es-AR", {
            month: "short",
            year: "2-digit",
          });
        },
      },
      axisLine: {
        lineStyle: {
          color: colorMode.value === "dark" ? "#666" : "#ccc",
        },
      },
      splitLine: {
        lineStyle: {
          color: colorMode.value === "dark" ? "#333" : "#e5e5e5",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Valores de la banda cambiaria",
      position: "left",
      nameTextStyle: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
      },
      axisLabel: {
        color: colorMode.value === "dark" ? "#fff" : "#000",
        formatter: (value: number) => `$${formatPrice(value)}`,
      },
      axisLine: {
        lineStyle: {
          color: colorMode.value === "dark" ? "#666" : "#ccc",
        },
      },
      splitLine: {
        lineStyle: {
          color: colorMode.value === "dark" ? "#333" : "#e5e5e5",
        },
      },
      min: "dataMin",
      max: "dataMax",
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        filterMode: "none",
        // Asegurar que los logos siempre estén visibles
        zoomLock: false,
      },
      {
        type: "inside",
        yAxisIndex: [0],
        filterMode: "none",
        zoomLock: false,
      },
      {
        type: "slider",
        xAxisIndex: [0],
        height: 20,
        bottom: 10,
        // Usar valores absolutos (timestamps) para el zoom inicial (±1 mes)
        // Esto es más confiable con ejes de tipo "time"
        rangeMode: ["value", "value"],
        startValue: initialRange.value.min,
        endValue: initialRange.value.max,
        filterMode: "none",
      },
      {
        type: "slider",
        yAxisIndex: [0],
        width: 20,
        right: 10,
        filterMode: "none",
        rangeMode: ["value", "value"],
      },
    ],
    series: [
      {
        name: "Banda inferior",
        type: "line",
        data: lowerBandData.value,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: "#ef4444", // Rojo
          width: 2,
        },
        itemStyle: {
          color: "#ef4444",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.2)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Banda superior",
        type: "line",
        data: upperBandData.value,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: "#f59e0b", // Naranja
          width: 2,
        },
        itemStyle: {
          color: "#f59e0b",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245, 158, 11, 0.2)" },
              { offset: 1, color: "rgba(245, 158, 11, 0.05)" },
            ],
          },
        },
      },
      // Series de proveedores (líneas de conexión y logos)
      ...providerSeries,
      // Serie para el indicador "Hoy" - línea vertical
      ...(showTodayIndicator
        ? [
            {
              name: "Hoy",
              type: "line",
              data: [
                [todayTimestamp, minY.value],
                [todayTimestamp, maxY.value],
              ],
              lineStyle: {
                color: "#10b981", // Verde
                width: 2,
                type: "dashed",
              },
              label: {
                show: true,
                position: "top",
                formatter: "Hoy",
                color: colorMode.value === "dark" ? "#fff" : "#000",
                fontSize: 12,
                fontWeight: "bold",
                backgroundColor:
                  colorMode.value === "dark"
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.7)",
                padding: [2, 4],
                borderRadius: 3,
                offset: [0, -5],
              },
              symbol: "none",
              z: 100,
              tooltip: {
                show: true,
                formatter: (_params: any) => {
                  const todayDate = new Date(todayTimestamp);
                  const timeString = todayDate.toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  // Lookup from precomputed band arrays
                  const lower = lowerBandData.value;
                  const upper = upperBandData.value;

                  // Find the closest entry to today
                  let closestLower = lower[0]?.[1] ?? 0;
                  let closestUpper = upper[0]?.[1] ?? 0;
                  let minDiff = Infinity;

                  for (let i = 0; i < lower.length; i++) {
                    const diff = Math.abs(lower[i][0] - todayTimestamp);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closestLower = lower[i][1];
                      closestUpper = upper[i][1];
                    }
                  }

                  return (
                    `<strong>${timeString}</strong><br/>` +
                    `Banda inferior: $${formatPrice(closestLower)}<br/>` +
                    `Banda superior: $${formatPrice(closestUpper)}`
                  );
                },
              },
            },
          ]
        : []),
    ],
    backgroundColor: "transparent",
    // Asegurar que el gráfico reaccione a los cambios de tema
    textStyle: {
      color: colorMode.value === "dark" ? "#fff" : "#000",
    },
  };
});
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

    <div class="w-full">
      <VChart
        ref="chartRef"
        :option="chartOption"
        class="w-full h-[500px]"
        autoresize
        @datazoom="handleDataZoom"
        @ready="setInitialZoom"
      />
    </div>
  </UCard>
</template>
