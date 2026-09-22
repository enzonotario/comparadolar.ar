<script setup lang="ts">
import { provide } from "vue";
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

interface Props {
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "usd",
});

/** Tailwind `sm` — endLabels need ~210px; below this use list + full-width plot. */
const isWide = useMediaQuery("(min-width: 640px)");

const colorMode = computed(() => useColorMode().value);
provide(
  THEME_KEY,
  computed(() => colorMode.value),
);

const chartHeight = computed(() => (isWide.value ? 280 : 220));

const initOptions = computed(() => ({
  height: chartHeight.value,
  width: "auto",
  renderer: "svg" as const,
}));
provide(INIT_OPTIONS_KEY, initOptions);

const isDark = computed(() => colorMode.value === "dark");
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

/** Match UBadge / UsdTypeBadge colors from app.config + Nuxt UI tokens. */
function badgeRichStyle(
  color: string,
  backgroundColor: string,
): Record<string, string | number | number[]> {
  return {
    fontSize: 10,
    fontWeight: 600,
    color,
    backgroundColor,
    padding: [3, 5],
    borderRadius: 4,
  };
}

const badgeRich = computed(() => {
  const dark = isDark.value;
  return {
    // success solid override → teal-100/800 · teal-900/200
    b247: badgeRichStyle(
      dark ? "#99f6e4" : "#115e59",
      dark ? "#134e4a" : "#ccfbf1",
    ),
    // info solid → blue
    bCcl: badgeRichStyle(
      dark ? "#18181b" : "#ffffff",
      dark ? "#60a5fa" : "#3b82f6",
    ),
    // neutral solid → inverted (zinc)
    bOficial: badgeRichStyle(
      dark ? "#18181b" : "#ffffff",
      dark ? "#ffffff" : "#18181b",
    ),
    // warning solid → amber
    bMEP: badgeRichStyle(
      dark ? "#18181b" : "#ffffff",
      dark ? "#fcd34d" : "#f59e0b",
    ),
    // secondary solid → cyan
    bCripto: badgeRichStyle(
      dark ? "#18181b" : "#ffffff",
      dark ? "#67e8f9" : "#06b6d4",
    ),
  };
});

function usdTypeRichKey(
  usdType: UsdProviderType,
): "bOficial" | "bMEP" | "bCripto" {
  if (usdType === "MEP") return "bMEP";
  if (usdType === "Cripto") return "bCripto";
  return "bOficial";
}

const chartOption = computed(() => {
  const labels = data.value.labels ?? [];
  const categories = labels.map(formatDayLabel);
  const textColor = isDark.value ? "#f4f4f5" : "#18181b";
  const mutedColor = isDark.value ? "#a1a1aa" : "#71717a";
  const splitColor = isDark.value ? "#3f3f46" : "#e4e4e7";
  const dayIdx = todayIndex.value;
  const richBadges = badgeRich.value;
  const wide = isWide.value;
  // Narrow: hide endLabel + shrink grid.right so bump lines stay readable.
  const series = seriesSource.value.map(
    (item: WeeklyRankingSeriesItem, index: number) => {
      const color = PALETTE[index % PALETTE.length]!;
      const meta = metaFor(item.slug, item.name);
      const todayRank = item.ranks[dayIdx];
      const todayPrice = item.prices[dayIdx];
      const showEnd = wide && todayRank != null;

      const badgeParts: string[] = [`{name|${item.name}}`];
      if (meta.is24x7) badgeParts.push("{b247|24/7}");
      if (meta.isCcl) badgeParts.push("{bCcl|CCL}");
      if (showUsdTypes.value && meta.showUsdType && meta.usdType) {
        const key = usdTypeRichKey(meta.usdType);
        badgeParts.push(`{${key}|${meta.usdType}}`);
      }
      if (todayPrice != null && todayPrice > 0) {
        badgeParts.push(`{price|$${formatPrice(todayPrice)}}`);
      }

      return {
        name: item.name,
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: wide ? 14 : 9,
        showSymbol: true,
        connectNulls: false,
        emphasis: {
          focus: "series" as const,
        },
        lineStyle: {
          width: wide ? 3 : 2,
          color,
        },
        itemStyle: {
          color,
        },
        endLabel: {
          show: showEnd,
          distance: 12,
          formatter: () => badgeParts.join(" "),
          rich: {
            name: {
              fontWeight: "bold",
              fontSize: 12,
              color,
              padding: [0, 4, 0, 0],
            },
            ...richBadges,
            price: {
              fontSize: 10,
              color: mutedColor,
              padding: [0, 0, 0, 2],
            },
          },
        },
        data: item.ranks.map((rank) => (rank == null ? null : rank)),
      };
    },
  );

  return {
    backgroundColor: "transparent",
    animationDuration: 400,
    tooltip: {
      trigger: "item",
      confine: !wide,
      formatter: (params: {
        seriesName?: string;
        value?: number | null;
        name?: string;
      }) => {
        if (params.value == null) return "";
        return `${params.seriesName}<br/>${params.name}: #${params.value}`;
      },
    },
    grid: {
      left: wide ? 36 : 28,
      right: wide ? 210 : 12,
      top: 16,
      bottom: wide ? 28 : 24,
      containLabel: false,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: categories,
      splitLine: {
        show: true,
        lineStyle: { color: splitColor, type: "dashed" },
      },
      axisLine: { lineStyle: { color: splitColor } },
      axisTick: { show: false },
      axisLabel: {
        color: mutedColor,
        fontSize: wide ? 11 : 10,
        margin: wide ? 12 : 8,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: "value",
      inverse: true,
      min: 1,
      max: topN.value,
      interval: 1,
      axisLabel: {
        color: mutedColor,
        fontSize: wide ? 11 : 10,
        margin: wide ? 10 : 6,
        formatter: (value: number) => `#${value}`,
      },
      splitLine: {
        show: true,
        lineStyle: { color: splitColor, type: "dashed" },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series,
    textStyle: {
      color: textColor,
      fontFamily: "inherit",
    },
  };
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
        <VChart
          :key="`${currency}-${activeSide}-${data.labels.join(',')}-${isWide ? 'wide' : 'narrow'}`"
          :option="chartOption"
          class="h-[220px] w-full sm:h-[280px]"
          autoresize
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
          <span
            class="w-7 shrink-0 font-mono text-xs font-semibold text-muted"
          >
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
