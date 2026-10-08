<script setup lang="ts">
import {
  areaY,
  barY,
  colorLegend,
  colorLegendItems,
  defineChart,
  lineY,
} from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { controlledSignal } from "@tanstack/charts/interaction/signal";
import { zoomX } from "@tanstack/charts/interaction/zoom";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { Chart } from "@tanstack/charts/vue";
import { scaleUtc } from "d3-scale";
import { calculateSpread } from "~/lib/utils";
import { RATE_DISPLAY, RATE_LABELS } from "~/lib/rate-labels";
import { getDateRange, timeRanges } from "~/composables/useChartData";
import { toApiCurrency } from "~/lib/market-constants";
import {
  extendSeriesToRange,
  formatAxisDate,
  formatPrice,
  formatSpread,
  formatTooltipDate,
  paddedDomain,
  smoothCurve,
  useChartInk,
  useZoomPlotHover,
  useZoomWindow,
} from "~/lib/charts/shared";

interface HistoryData {
  bid: number;
  ask: number;
  pct_variation: number;
  timestamp: string;
}

const props = defineProps<{
  provider: string;
  currency: string;
}>();

const { isDark, textColor, gridColor } = useChartInk();
const selectedRange = ref("7d");
const apiCurrency = toApiCurrency(props.currency);

const {
  data: historyData,
  pending: isLoading,
  error,
  refresh: refetch,
} = useFetch<HistoryData[]>(
  `https://api.comparadolar.ar/${apiCurrency}/providers/${props.provider}/history`,
  {
    server: false,
    lazy: true,
  },
);

const chartData = computed(() => {
  if (!historyData.value) return [];

  const { start, end } = getDateRange(selectedRange.value);

  return historyData.value
    .filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    })
    .map((item) => ({
      bid: item.bid,
      ask: item.ask,
      timestamp: item.timestamp,
      spread: calculateSpread(item.ask, item.bid),
    }));
});

const extent = computed(() => {
  const { start, end } = getDateRange(selectedRange.value);
  return [start, end] as const;
});

const zoomWindow = useZoomWindow(extent);

const spreadColor = computed(() => (isDark.value ? "#3f3f46" : "#d4d4d8"));

interface PricePoint {
  x: Date;
  y: number;
  series: string;
}

const definition = computed(() => {
  const items = chartData.value;
  const current = zoomWindow.value;
  const dates = extent.value;
  if (!items.length || !current) return null;

  const [start, end] = dates;
  const ask = extendSeriesToRange(
    items.map((item) => ({ timestamp: item.timestamp, value: item.ask })),
    start,
    end,
  ).map((point) => ({ ...point, series: RATE_LABELS.ask }));
  const bid = extendSeriesToRange(
    items.map((item) => ({ timestamp: item.timestamp, value: item.bid })),
    start,
    end,
  ).map((point) => ({ ...point, series: RATE_LABELS.bid }));
  const spread = extendSeriesToRange(
    items.map((item) => ({ timestamp: item.timestamp, value: item.spread })),
    start,
    end,
  );
  const [yMin, yMax] = paddedDomain([...ask, ...bid].map((point) => point.y));
  const spreadMax = Math.max(...spread.map((point) => point.y), 0);
  const xScale = scaleUtc().domain([current.start, current.end]);

  const priceMark = (
    rows: PricePoint[],
    label: string,
    color: string,
    gradientId: string,
  ) => [
    decorative(
      areaY(rows, {
        x: (row: PricePoint) => row.x,
        y1: yMin,
        y2: (row: PricePoint) => row.y,
        fill: `url(#${gradientId})`,
        curve: smoothCurve,
        key: (row: PricePoint) => row.x.toISOString(),
      }),
    ),
    lineY(rows, {
      x: (row: PricePoint) => row.x,
      y: (row: PricePoint) => row.y,
      color: () => label,
      stroke: color,
      strokeWidth: 2,
      curve: smoothCurve,
      key: (row: PricePoint) => row.x.toISOString(),
    }),
  ];

  return defineChart(
    {
      clip: true,
      margin: { top: 28, bottom: 28 },
      gradients: [
        {
          id: "history-ask",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0, color: RATE_DISPLAY.ask.chartColor, opacity: 0.3 },
            { offset: 1, color: RATE_DISPLAY.ask.chartColor, opacity: 0.05 },
          ],
        },
        {
          id: "history-bid",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0, color: RATE_DISPLAY.bid.chartColor, opacity: 0.3 },
            { offset: 1, color: RATE_DISPLAY.bid.chartColor, opacity: 0.05 },
          ],
        },
      ],
      marks: [
        barY(spread, {
          x: (row) => row.x,
          y1: 0,
          y2: (row) => row.y,
          yScale: "spread",
          fill: spreadColor.value,
          maxThickness: 10,
          color: () => RATE_LABELS.spread,
          key: (row) => row.x.toISOString(),
        }),
        ...priceMark(
          ask,
          RATE_LABELS.ask,
          RATE_DISPLAY.ask.chartColor,
          "history-ask",
        ),
        ...priceMark(
          bid,
          RATE_LABELS.bid,
          RATE_DISPLAY.bid.chartColor,
          "history-bid",
        ),
      ],
      scales: {
        x: {
          scale: xScale,
          grid: false,
          axis: {
            ticks: {
              format: (value: Date) =>
                formatAxisDate(value, selectedRange.value),
            },
            tickLabels: { thin: true, fontSize: 11 },
          },
        },
        y: {
          scale: scaleLinear().domain([yMin, yMax]),
          grid: { stroke: gridColor.value, strokeDasharray: "4 4" },
          axis: {
            label: "Precio",
            ticks: { format: (value: number) => `$${formatPrice(value)}` },
          },
        },
        spread: {
          channel: "y",
          side: "right",
          scale: scaleLinear().domain([0, spreadMax * 1.15 || 1]),
          grid: false,
          axis: {
            label: "Spread",
            ticks: { format: (value: number) => formatSpread(value) },
          },
        },
      },
      color: {
        domain: [RATE_LABELS.ask, RATE_LABELS.bid, RATE_LABELS.spread],
        range: [
          RATE_DISPLAY.ask.chartColor,
          RATE_DISPLAY.bid.chartColor,
          spreadColor.value,
        ],
        legend: colorLegend({
          placement: "top",
          items: colorLegendItems({
            indicator: {
              shape: (value) =>
                value === RATE_LABELS.spread ? "square" : "line",
            },
          }),
        }),
      },
      theme: {
        foreground: textColor.value,
        muted: textColor.value,
        grid: gridColor.value,
        background: "transparent",
      },
      controls: [
        zoomX({
          window: controlledSignal(current, (next) => {
            zoomWindow.value = { start: next.start, end: next.end };
          }),
          extent: [dates[0], dates[1]],
          ariaLabel: "Período visible de la cotización histórica",
          format: (value) => formatTooltipDate(value),
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
          const focused = points[0]?.datum as { x?: Date } | undefined;
          const time = focused?.x;
          if (!(time instanceof Date)) return { rows: [] };
          const closest = <T extends { x: Date }>(rows: readonly T[]) =>
            rows.reduce<T | null>((best, point) => {
              if (!best) return point;
              return Math.abs(point.x.getTime() - time.getTime()) <
                Math.abs(best.x.getTime() - time.getTime())
                ? point
                : best;
            }, null);
          const askPoint = closest(ask);
          const bidPoint = closest(bid);
          const spreadPoint = closest(spread);
          return {
            title: formatTooltipDate(time),
            rows: [
              askPoint
                ? {
                    label: RATE_LABELS.ask,
                    value: `$${formatPrice(askPoint.y)}`,
                    color: RATE_DISPLAY.ask.chartColor,
                  }
                : null,
              bidPoint
                ? {
                    label: RATE_LABELS.bid,
                    value: `$${formatPrice(bidPoint.y)}`,
                    color: RATE_DISPLAY.bid.chartColor,
                  }
                : null,
              spreadPoint
                ? {
                    label: RATE_LABELS.spread,
                    value: formatSpread(spreadPoint.y),
                    color: spreadColor.value,
                  }
                : null,
            ].filter((row) => row != null),
          };
        },
      },
    },
  );
});

const { onRender: onZoomPlotHover } = useZoomPlotHover();
</script>

<template>
  <UCard
    :ui="{
      body: '!p-0',
    }"
  >
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          />
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Cotización Histórica
            </h3>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="range in timeRanges"
            :key="range.value"
            :variant="selectedRange === range.value ? 'solid' : 'outline'"
            color="neutral"
            size="xs"
            @click="selectedRange = range.value"
          >
            {{ range.label }}
          </UButton>
        </div>
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">Cargando datos históricos...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-8 h-8 text-red-500 mx-auto mb-2"
        />
        <p class="text-sm text-red-500 mb-2">
          Error al cargar los datos históricos
        </p>
        <UButton size="sm" @click="() => refetch()"> Reintentar </UButton>
      </div>
    </div>

    <div v-else-if="chartData && chartData.length > 0" class="w-full">
      <Chart
        v-if="definition"
        :definition="definition"
        aria-label="Cotización histórica del proveedor"
        class="h-80 w-full"
        :height="320"
        @render="onZoomPlotHover"
      />
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-chart-line"
          class="w-8 h-8 text-gray-400 mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">No hay datos históricos disponibles</p>
      </div>
    </div>
  </UCard>
</template>
