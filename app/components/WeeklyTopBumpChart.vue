<script setup lang="ts">
import { defineChart, dot, lineY, text } from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { Chart } from "@tanstack/charts/vue";
import { useMediaQuery } from "@vueuse/core";
import type { TabsItem } from "@nuxt/ui";
import type {
  CurrencyType,
  ExchangeRate,
  NormalizedCryptoRate,
  UsdProviderType,
  WeeklyRankingSeriesItem,
} from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/types";
import {
  getProviderUsdType,
  isCryptoCurrency,
  isUsdCclProvider,
  shouldShowUsdTypeBadge,
} from "~/lib/market-constants";
import { RATE_DISPLAY } from "~/lib/rate-labels";
import { smoothCurve, useChartInk } from "~/lib/charts/shared";

interface Props {
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "usd",
});

/** Tailwind `sm` — endLabels need ~210px; below this use list + full-width plot. */
const isWide = useMediaQuery("(min-width: 640px)");

const { isDark, textColor, mutedColor, gridColor } = useChartInk();

const chartHeight = computed(() => (isWide.value ? 280 : 220));
const isUsd = computed(
  () => props.currency === "usd" || props.currency === "usd-ccl",
);
const showUsdTypes = computed(
  () => isUsd.value && !isCryptoCurrency(props.currency),
);

const { data, hasData, isLoading } = useWeeklyRankings(() => props.currency);

const quotesUrl = computed(() => {
  const key =
    props.currency === "usd-ccl" ? "usd" : (props.currency as CurrencyType);
  return API_ENDPOINTS[key as keyof typeof API_ENDPOINTS] ?? API_ENDPOINTS.usd;
});

const { data: quotesRaw } = useAsyncData(
  () => `weekly-top-quotes:${quotesUrl.value}`,
  async () => {
    try {
      return await $fetch<
        ExchangeRate[] | Record<string, NormalizedCryptoRate>
      >(quotesUrl.value);
    } catch {
      return [] as ExchangeRate[];
    }
  },
  {
    watch: [quotesUrl],
    default: () => [] as ExchangeRate[],
  },
);

type ProviderMeta = {
  is24x7: boolean;
  isCcl: boolean;
  usdType?: UsdProviderType;
  showUsdType: boolean;
};

const providerMeta = computed(() => {
  const map = new Map<string, ProviderMeta>();

  const upsert = (rate: {
    slug?: string;
    name?: string;
    is24x7?: boolean;
    usdType?: UsdProviderType;
  }) => {
    if (!rate?.slug) return;
    map.set(rate.slug, {
      is24x7: Boolean(rate.is24x7),
      isCcl: isUsdCclProvider(rate),
      usdType: rate.usdType ?? getProviderUsdType(rate),
      showUsdType: shouldShowUsdTypeBadge(rate),
    });
  };

  const raw = quotesRaw.value;
  if (Array.isArray(raw)) {
    for (const rate of raw) upsert(rate);
  } else if (raw && typeof raw === "object") {
    for (const rate of Object.values(raw)) upsert(rate);
  }
  return map;
});

function metaFor(slug: string | undefined, name: string): ProviderMeta {
  if (slug && providerMeta.value.has(slug)) {
    return providerMeta.value.get(slug)!;
  }
  return {
    is24x7: false,
    isCcl: slug ? isUsdCclProvider({ slug, name }) : false,
    usdType: slug ? getProviderUsdType({ slug, name }) : undefined,
    showUsdType: isUsd.value && shouldShowUsdTypeBadge({ slug, name }),
  };
}

const activeSide = ref<"buy" | "sell">("buy");

const sideTabs = [
  {
    label: RATE_DISPLAY.ask.label,
    value: "buy",
    icon: RATE_DISPLAY.ask.icon,
  },
  {
    label: RATE_DISPLAY.bid.label,
    value: "sell",
    icon: RATE_DISPLAY.bid.icon,
  },
] satisfies TabsItem[];

const PALETTE = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

const seriesSource = computed(() => {
  const side = activeSide.value;
  return side === "buy" ? data.value.buy.series : data.value.sell.series;
});

const todayIndex = computed(() =>
  Math.max(0, (data.value.labels?.length ?? 1) - 1),
);

const topN = computed(() => data.value.topN || 5);

type RankingRow = {
  slug: string;
  name: string;
  color: string;
  rank: number;
  price: number | null;
  meta: ProviderMeta;
};

/** Today's ranking for the mobile list (chart endLabels stay on sm+). */
const rankingRows = computed((): RankingRow[] => {
  const dayIdx = todayIndex.value;
  return seriesSource.value
    .map((item: WeeklyRankingSeriesItem, index: number) => {
      const rank = item.ranks[dayIdx];
      if (rank == null) return null;
      const price = item.prices[dayIdx];
      return {
        slug: item.slug,
        name: item.name,
        color: PALETTE[index % PALETTE.length]!,
        rank,
        price: price != null && price > 0 ? price : null,
        meta: metaFor(item.slug, item.name),
      };
    })
    .filter((row): row is RankingRow => row != null)
    .sort((a, b) => a.rank - b.rank);
});

interface RankPoint {
  series: string;
  day: string;
  rank: number;
  color: string;
}

interface RankSegment {
  id: string;
  color: string;
  points: RankPoint[];
}

function endCaption(
  item: WeeklyRankingSeriesItem,
  meta: ProviderMeta,
  price: number | null,
) {
  const parts = [item.name];
  if (meta.is24x7) parts.push("24/7");
  if (meta.isCcl) parts.push("CCL");
  if (showUsdTypes.value && meta.showUsdType && meta.usdType) {
    parts.push(meta.usdType);
  }
  if (price != null && price > 0) parts.push(`$${formatPrice(price)}`);
  return parts.join(" · ");
}

function groupByColor(points: RankPoint[]) {
  const groups = new Map<string, RankPoint[]>();
  for (const point of points) {
    const group = groups.get(point.color);
    if (group) group.push(point);
    else groups.set(point.color, [point]);
  }
  return [...groups.entries()];
}

const rankModel = computed(() => {
  const labels = data.value.labels ?? [];
  const categories = labels.map(formatDayLabel);
  const dayIdx = todayIndex.value;
  const wide = isWide.value;
  const segments: RankSegment[] = [];
  const dots: RankPoint[] = [];
  const captions: Array<RankPoint & { caption: string }> = [];

  seriesSource.value.forEach((item: WeeklyRankingSeriesItem, index: number) => {
    const color = PALETTE[index % PALETTE.length]!;
    let current: RankPoint[] = [];
    const flush = () => {
      if (!current.length) return;
      segments.push({
        id: `${item.slug}-${segments.length}`,
        color,
        points: current,
      });
      current = [];
    };

    item.ranks.forEach((rank, rankIndex) => {
      const day = categories[rankIndex];
      if (rank == null || !day) {
        flush();
        return;
      }
      const point: RankPoint = {
        series: item.name,
        day,
        rank,
        color,
      };
      current.push(point);
      dots.push(point);
      if (wide && rankIndex === dayIdx) {
        const price = item.prices[rankIndex];
        captions.push({
          ...point,
          caption: endCaption(
            item,
            metaFor(item.slug, item.name),
            price != null && price > 0 ? price : null,
          ),
        });
      }
    });
    flush();
  });

  return { categories, segments, dots, captions };
});

const definition = computed(() => {
  const { categories, segments, dots, captions } = rankModel.value;
  if (!categories.length || segments.length === 0) return null;

  const rankTicks = Array.from({ length: topN.value }, (_, index) => index + 1);
  const wide = isWide.value;

  return defineChart(
    {
      margin: {
        top: 12,
        right: wide ? 220 : 12,
        bottom: 8,
        left: 8,
      },
      marks: [
        ...segments.map((segment) =>
          lineY(segment.points, {
            x: (row: RankPoint) => row.day,
            y: (row: RankPoint) => row.rank,
            stroke: segment.color,
            strokeWidth: wide ? 3 : 2,
            curve: smoothCurve,
            key: (row: RankPoint) => `${segment.id}-${row.day}`,
          }),
        ),
        ...groupByColor(dots).map(([color, points]) =>
          dot(points, {
            x: (row: RankPoint) => row.day,
            y: (row: RankPoint) => row.rank,
            r: wide ? 7 : 4.5,
            fill: color,
            stroke: isDark.value ? "#18181b" : "#ffffff",
            strokeWidth: 2,
            key: (row: RankPoint) => `${row.series}-${row.day}`,
          }),
        ),
        ...(captions.length
          ? [
              decorative(
                text(captions, {
                  x: (row: RankPoint) => row.day,
                  y: (row: RankPoint) => row.rank,
                  text: (row: (typeof captions)[number]) => row.caption,
                  anchor: "start",
                  dx: 14,
                  fontSize: 12,
                  fontWeight: 700,
                  fill: (row: RankPoint) => row.color,
                }),
              ),
            ]
          : []),
      ],
      scales: {
        x: {
          scale: () => scalePoint<string>().domain(categories).padding(0.15),
          grid: { stroke: gridColor.value, strokeDasharray: "4 4" },
          axis: {
            line: { stroke: gridColor.value },
            ticks: { size: 0 },
            tickLabels: {
              thin: true,
              fontSize: wide ? 11 : 10,
              fill: mutedColor.value,
            },
          },
        },
        y: {
          scale: scaleLinear().domain([1, topN.value]),
          reverse: true,
          grid: { stroke: gridColor.value, strokeDasharray: "4 4" },
          axis: {
            line: false,
            ticks: {
              values: rankTicks,
              size: 0,
              format: (value: number) => `#${value}`,
            },
            tickLabels: {
              fontSize: wide ? 11 : 10,
              fill: mutedColor.value,
            },
          },
        },
      },
      theme: {
        foreground: textColor.value,
        muted: mutedColor.value,
        grid: gridColor.value,
        background: "transparent",
        fontFamily: "inherit",
      },
    },
    {
      focus: "nearest",
      tooltip: {
        use: tooltip,
        portal,
        content: (points) => {
          const row = points[0]?.datum as RankPoint | undefined;
          if (!row) return { rows: [] };
          return {
            title: row.series,
            color: row.color,
            rows: [{ label: row.day, value: `#${row.rank}` }],
          };
        },
      },
    },
  );
});
</script>

<template>
  <UCard
    v-if="hasData || isLoading"
    :ui="{
      header: 'px-4 py-3 sm:px-5',
      body: 'px-4 pb-3 pt-0 sm:px-5 sm:pb-3',
    }"
  >
    <template #header>
      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h2 class="text-lg font-bold text-zinc-900 dark:text-white">
          Top semanal
        </h2>

        <UTabs
          v-model="activeSide"
          :items="sideTabs"
          :content="false"
          size="xs"
          color="neutral"
          variant="pill"
          class="w-full shrink-0 sm:w-auto"
        />
      </div>
    </template>

    <div
      v-if="isLoading && !hasData"
      class="flex h-[220px] items-center justify-center text-sm text-muted sm:h-[280px]"
    >
      Cargando ranking semanal…
    </div>

    <div
      v-else-if="seriesSource.length === 0"
      class="flex h-[120px] items-center justify-center text-sm text-muted"
    >
      No hay datos de ranking para este lado.
    </div>

    <div v-else class="w-full">
      <ClientOnly>
        <Chart
          v-if="definition"
          :key="`${currency}-${activeSide}-${data.labels.join(',')}-${isWide ? 'wide' : 'narrow'}`"
          :definition="definition"
          aria-label="Ranking semanal de cotizaciones"
          class="h-[220px] w-full sm:h-[280px]"
          :height="chartHeight"
        />
        <template #fallback>
          <div
            class="flex h-[220px] items-center justify-center text-sm text-muted sm:h-[280px]"
          >
            Cargando gráfico…
          </div>
        </template>
      </ClientOnly>

      <ol
        v-if="!isWide && rankingRows.length"
        class="mt-3 divide-y divide-default border-t border-default"
        aria-label="Ranking de hoy"
      >
        <li
          v-for="row in rankingRows"
          :key="row.slug"
          class="flex items-center gap-2.5 py-2.5"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: row.color }"
            aria-hidden="true"
          />
          <span class="w-7 shrink-0 font-mono text-xs font-semibold text-muted">
            #{{ row.rank }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="truncate text-sm font-semibold"
                :style="{ color: row.color }"
              >
                {{ row.name }}
              </span>
              <UBadge v-if="row.meta.is24x7" color="success" size="xs">
                24/7
              </UBadge>
              <UBadge v-if="row.meta.isCcl" color="info" size="xs">
                CCL
              </UBadge>
              <UsdTypeBadge
                v-if="showUsdTypes && row.meta.showUsdType"
                :usd-type="row.meta.usdType"
                :slug="row.slug"
                :name="row.name"
              />
            </div>
          </div>
          <span
            v-if="row.price != null"
            class="shrink-0 font-mono text-xs tabular-nums text-muted"
          >
            ${{ formatPrice(row.price) }}
          </span>
        </li>
      </ol>
    </div>
  </UCard>
</template>
