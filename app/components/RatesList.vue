<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { ExchangeRate } from "@/lib/types";
import type { TableColumn, TabsItem } from "@nuxt/ui";

const items = [
  {
    label: "Quiero comprar",
    value: "buy",
    icon: "i-heroicons-arrow-down",
  },
  {
    label: "Quiero vender",
    value: "sell",
    icon: "i-heroicons-arrow-up",
  },
] satisfies TabsItem[];

const UButton = resolveComponent("UButton");

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
            label: activeTab.value === "buy" ? "Compras a" : "Vendes a",
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
      accessorFn: (row) => {
        if (
          row.ask == null ||
          row.ask <= 0 ||
          row.bid == null ||
          row.bid <= 0
        ) {
          return Infinity;
        }
        return row.ask - row.bid;
      },
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
    if (activeTab.value === "buy") {
      return rate.ask != null && rate.ask > 0;
    } else {
      return rate.bid != null && rate.bid > 0;
    }
  });

  return rates;
});

const realTimeRates = computed(() => {
  const excludeCcl = props.currency !== "usd-ccl";
  return filteredRates.value
    .filter((rate) => !rate.slowChange && (!excludeCcl || !rate.isUsdCcl))
    .map((rate) => ({
      ...rate,
      price: activeTab.value === "buy" ? rate.ask : rate.bid,
    }));
});

const slowChangeRates = computed(() => {
  const excludeCcl = props.currency !== "usd-ccl";
  return filteredRates.value
    .filter(
      (rate) => rate.slowChange === true && (!excludeCcl || !rate.isUsdCcl),
    )
    .map((rate) => ({
      ...rate,
      price: activeTab.value === "buy" ? rate.ask : rate.bid,
    }));
});

const usdCclRates = computed(() => {
  if (props.currency === "usd-ccl") return [];

  return filteredRates.value
    .filter((rate) => rate.isUsdCcl === true)
    .map((rate) => ({
      ...rate,
      price: activeTab.value === "buy" ? rate.ask : rate.bid,
    }));
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
        body: '!p-0',
      }"
    >
      <UTabs
        v-model="activeTab"
        :items="items"
        variant="link"
        color="neutral"
        :ui="{
          trigger: 'grow',
          label: 'cursor-pointer',
        }"
        class="gap-0 w-full"
      >
        <template #content>
          <div
            v-if="props.currency === 'usd' || props.currency === 'usd-ccl'"
            class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 font-medium"
          >
            Actualizado en tiempo real
          </div>

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

          <RateTable
            v-else
            v-model:sorting="sorting"
            :rates="realTimeRates"
            :columns="columns"
            :currency="props.currency"
            :active-tab="activeTab"
            :is-loading="isLoading"
          />

          <div
            v-if="!isLoading && slowChangeRates.length > 0"
            class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-t border-b border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 font-medium"
          >
            Actualizado en 30+ minutos
          </div>
          <RateTable
            v-if="!isLoading && slowChangeRates.length > 0"
            v-model:sorting="sorting"
            :rates="slowChangeRates"
            :columns="columns"
            :currency="props.currency"
            :active-tab="activeTab"
            :is-loading="isLoading"
          />

          <div
            v-if="!isLoading && usdCclRates.length > 0"
            class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-t border-b border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 font-medium"
          >
            USD CCL
          </div>
          <RateTable
            v-if="!isLoading && usdCclRates.length > 0"
            v-model:sorting="sorting"
            :rates="usdCclRates"
            :columns="columns"
            :currency="props.currency"
            :active-tab="activeTab"
            :is-loading="isLoading"
          />

          <div
            v-if="!isLoading && usdCclRates.length > 0"
            class="border-t border-zinc-200 dark:border-zinc-700 px-4 py-3 flex justify-center"
          >
            <UButton
              to="/usd-ccl"
              color="neutral"
              variant="outline"
              size="sm"
              trailing-icon="i-heroicons-arrow-right"
            >
              Ver solo USD CCL
            </UButton>
          </div>
        </template>
      </UTabs>
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
