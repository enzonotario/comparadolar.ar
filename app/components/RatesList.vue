<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { ExchangeRate } from "@/lib/types";
import type { TableColumn, TabsItem } from "@nuxt/ui";
import { RATE_DISPLAY, RATE_LABELS } from "@/lib/rate-labels";
import {
  compareExchangeRatesByPrice,
  compareExchangeRatesBySpread,
  compareExchangeRatesForBuy,
  getExchangeSpreadAbs,
} from "@/lib/exchange-rate-sort";
import { getProviderDisplayName } from "@/lib/provider-display";

const items = [
  {
    label: "Quiero comprar",
    value: "buy",
    icon: RATE_DISPLAY.ask.icon,
  },
  {
    label: "Quiero vender",
    value: "sell",
    icon: RATE_DISPLAY.bid.icon,
  },
] satisfies TabsItem[];

const UButton = resolveComponent("UButton");

type RatedExchangeRate = ExchangeRate & { price: number };

interface Props {
  data: ExchangeRate[] | null;
  error: Error | null;
  isLoading: boolean;
  onRetry?: () => void;
  currency: string;
}

const props = defineProps<Props>();

const activeTab = ref<"buy" | "sell">("buy");
const { showOnly24x7 } = use24x7Filter();
const { matchesFilter: matchesUsdType } = useUsdTypeFilter();
const sorting: Ref<Array<{ id: string; desc: boolean }>> = ref([]);

const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIsMobile);
});

watch(
  () => activeTab.value,
  () => {
    sorting.value = [
      {
        id: "price",
        desc: activeTab.value !== "sell" ? false : true,
      },
    ];
  },
  { immediate: true },
);

function sortRates(rates: RatedExchangeRate[]) {
  const items = [...rates];
  const sortDef = sorting.value[0];

  if (!sortDef || sortDef.id === "price") {
    const desc = sortDef?.desc ?? activeTab.value === "sell";
    const side = activeTab.value === "buy" ? "ask" : "bid";
    return items.sort((a, b) => compareExchangeRatesByPrice(a, b, side, desc));
  }

  if (sortDef.id === "spread") {
    return items.sort((a, b) =>
      compareExchangeRatesBySpread(a, b, sortDef.desc),
    );
  }

  if (sortDef.id === "name") {
    return items.sort((a, b) => {
      const nameCmp = getProviderDisplayName(a).localeCompare(
        getProviderDisplayName(b),
        "es",
        { sensitivity: "base" },
      );
      return sortDef.desc ? -nameCmp : nameCmp;
    });
  }

  return items.sort((a, b) => compareExchangeRatesForBuy(a, b));
}

const columns = computed<TableColumn<ExchangeRate>[]>(() => {
  const baseColumns: TableColumn<ExchangeRate>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Proveedor",
          icon: isSorted
            ? isSorted === "asc"
              ? "i-lucide-arrow-up-narrow-wide"
              : "i-lucide-arrow-down-wide-narrow"
            : "i-heroicons-arrows-up-down",
          class: "-mx-2.5",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        });
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(
          "div",
          { class: "text-center" },
          h(UButton, {
            color: "neutral",
            variant: "ghost",
            label:
              activeTab.value === "buy" ? RATE_LABELS.ask : RATE_LABELS.bid,
            icon: isSorted
              ? isSorted === "asc"
                ? "i-lucide-arrow-up-narrow-wide"
                : "i-lucide-arrow-down-wide-narrow"
              : "i-heroicons-arrows-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          }),
        );
      },
    },
  ];

  if (!isMobile.value) {
    baseColumns.push({
      id: "spread",
      accessorFn: (row) => getExchangeSpreadAbs(row),
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(
          "div",
          { class: "text-center" },
          h(UButton, {
            color: "neutral",
            variant: "ghost",
            label: "Spread",
            icon: isSorted
              ? isSorted === "asc"
                ? "i-lucide-arrow-up-narrow-wide"
                : "i-lucide-arrow-down-wide-narrow"
              : "i-heroicons-arrows-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          }),
        );
      },
    });
  }

  return baseColumns;
});

const filteredRates = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return [];

  let rates = [...props.data];

  if (showOnly24x7.value) {
    rates = rates.filter((rate) => rate.is24x7);
  }

  rates = rates.filter((rate) => {
    if (props.currency === "usd" && !matchesUsdType(rate)) return false;
    if (activeTab.value === "buy") {
      return rate.ask != null && rate.ask > 0;
    } else {
      return rate.bid != null && rate.bid > 0;
    }
  });

  return rates;
});

const realTimeRates = computed(() => {
  return sortRates(
    filteredRates.value
      .filter((rate) => !rate.slowChange)
      .map((rate) => ({
        ...rate,
        price: activeTab.value === "buy" ? rate.ask! : rate.bid!,
      })),
  );
});

const slowChangeRates = computed(() => {
  return sortRates(
    filteredRates.value
      .filter((rate) => rate.slowChange === true)
      .map((rate) => ({
        ...rate,
        price: activeTab.value === "buy" ? rate.ask! : rate.bid!,
      })),
  );
});

const handleRetry = () => {
  if (props.onRetry) {
    props.onRetry();
  }
};
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      title="Error al cargar datos"
      :description="error.message"
    >
      <template #actions>
        <UButton color="red" variant="soft" @click="handleRetry">
          Reintentar
        </UButton>
      </template>
    </UAlert>

    <UCard
      v-if="isLoading || (data && data.length > 0)"
      :ui="{
        header: '!p-0',
        body: '!p-0',
      }"
    >
      <UTabs
        v-model="activeTab"
        :items="items"
        :content="false"
        variant="link"
        color="neutral"
        :ui="{
          trigger: 'grow',
          label: 'cursor-pointer',
        }"
        class="gap-0 w-full"
      />

      <div
        v-if="isLoading"
        class="divide-y divide-zinc-200 dark:divide-zinc-700"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="px-4 py-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-3 flex-1">
            <USkeleton class="h-8 w-8 rounded-full" />
            <div class="space-y-1 flex-1">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 w-16" />
            </div>
          </div>
          <div class="flex items-center gap-6">
            <USkeleton class="h-5 w-20" />
            <USkeleton v-if="!isMobile" class="h-5 w-16" />
          </div>
        </div>
      </div>

      <template v-else>
        <RateTable
          v-model:sorting="sorting"
          manual-sorting
          :rates="realTimeRates"
          :columns="columns"
          :currency="props.currency"
          :active-tab="activeTab"
          :is-loading="isLoading"
        />

        <div
          v-if="slowChangeRates.length > 0"
          class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-t border-b border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 font-medium"
        >
          Actualizado en 30+ minutos
        </div>
        <RateTable
          v-if="slowChangeRates.length > 0"
          v-model:sorting="sorting"
          manual-sorting
          :rates="slowChangeRates"
          :columns="columns"
          :currency="props.currency"
          :active-tab="activeTab"
          :is-loading="isLoading"
        />
      </template>
    </UCard>

    <div v-else class="text-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-zinc-400"
        />
        <h3 class="text-lg font-medium text-zinc-900 dark:text-white">
          No hay datos disponibles
        </h3>
      </div>
      <p class="text-zinc-500 dark:text-zinc-400 mt-2">
        No se pudieron cargar las cotizaciones en este momento.
      </p>
    </div>
  </div>
</template>
