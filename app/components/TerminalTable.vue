<script setup lang="ts">
import {
  computed,
  h,
  onMounted,
  onUnmounted,
  ref,
  resolveComponent,
  watch,
} from "vue";
import { useDebounceFn } from "@vueuse/core";
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/types";
import { RATE_LABELS, RATE_LABELS_UPPER } from "@/lib/rate-labels";
import type { TableColumn } from "@nuxt/ui";
import { use24x7Filter } from "@/composables/use24x7Filter";
import { useTerminalColors } from "@/composables/useTerminalColors";
import { useRouteQuery } from "@vueuse/router";
import { getProviderDisplayName } from "@/lib/provider-display";
import { getResizedImageUrl } from "@/lib/image-url";

interface Props {
  currency: CurrencyType;
}

const props = defineProps<Props>();

const toast = useToast();
const marketHours = ref(true);
const { showOnly24x7 } = use24x7Filter();
const { matchesFilter: matchesUsdType } = useUsdTypeFilter();
const { saveSortToStorage, saveSelectedToStorage, loadSavedState } =
  useTerminalState();

// URL query params for sorting
const sortQuery = useRouteQuery<string | null>("sort", null);

// Parse sort query into sorting state
const parseSortQuery = (query: string | null) => {
  if (!query) return [{ id: "spreadPercentage", desc: false }];
  const [id, direction] = query.split(":");
  return [{ id, desc: direction === "desc" }];
};

// Parse selected query into row selection state
const parseSelectedQuery = (query: string | null) => {
  if (!query) return {};
  const slugs = query.split(",");
  return Object.fromEntries(slugs.map((slug) => [slug, true]));
};

// Initialize from URL params only; localStorage is restored on mount.
const sorting = ref(parseSortQuery(sortQuery.value || null));

const selectedQuery = useRouteQuery<string | null>("selected", null);
const rowSelection = ref(parseSelectedQuery(selectedQuery.value || null));

const debouncedSaveSort = useDebounceFn((sortString: string) => {
  saveSortToStorage(props.currency, sortString);
}, 300);

const debouncedSaveSelection = useDebounceFn((selectionString: string) => {
  saveSelectedToStorage(props.currency, selectionString);
}, 300);

watch(
  sorting,
  (newSort) => {
    if (newSort && newSort.length > 0) {
      const sortString = `${newSort[0].id}:${newSort[0].desc ? "desc" : "asc"}`;
      sortQuery.value = sortString;
      debouncedSaveSort(sortString);
    }
  },
  { deep: true },
);

watch(
  rowSelection,
  (newSelection) => {
    const selectedSlugs = Object.keys(newSelection).filter(
      (key) => newSelection[key],
    );
    const selectionString = selectedSlugs.join(",");
    selectedQuery.value = selectionString || null;
    debouncedSaveSelection(selectionString);
  },
  { deep: true },
);

// Reset state function
const resetState = () => {
  sorting.value = [{ id: "spreadPercentage", desc: false }];
  rowSelection.value = {};
  sortQuery.value = null;
  selectedQuery.value = null;
  saveSortToStorage(props.currency, "");
  saveSelectedToStorage(props.currency, "");
  toast.add({
    title: "Estado reiniciado",
    description: "Se han limpiado el ordenamiento y la selección",
    color: "success",
    icon: "i-lucide-refresh-ccw",
  });
};

const table = useTemplateRef("table");

const { terminalColors } = useTerminalColors(computed(() => props.currency));
const { getSeries: getTrendSeries } = useProviderTrends(() => props.currency);

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UCheckbox = resolveComponent("UCheckbox");

const { data: usdRates, isLoading: usdLoading } = useDataFetching<
  ExchangeRate[]
>(API_ENDPOINTS.usd);
const { data: usdcRates, isLoading: usdcLoading } = useCryptoData("usdc");
const { data: usdtRates, isLoading: usdtLoading } = useCryptoData("usdt");
const { data: btcRates, isLoading: btcLoading } = useCryptoData("btc");
const { data: ethRates, isLoading: ethLoading } = useCryptoData("eth");

const isMarketHours = () => {
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDay();

  const isWeekday = day >= 1 && day <= 5;
  return isWeekday && hours >= 10 && hours < 16;
};

let marketHoursInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  if (import.meta.client) {
    const defer =
      window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1));

    defer(() => {
      marketHours.value = isMarketHours();
      marketHoursInterval = setInterval(() => {
        marketHours.value = isMarketHours();
      }, 60000);
    });

    if (sortQuery.value) {
      sorting.value = parseSortQuery(sortQuery.value);
    } else {
      const { savedSort } = loadSavedState(props.currency);
      if (savedSort) {
        sorting.value = parseSortQuery(savedSort);
      }
    }

    if (selectedQuery.value) {
      rowSelection.value = parseSelectedQuery(selectedQuery.value);
    } else {
      const { savedSelected } = loadSavedState(props.currency);
      if (savedSelected) {
        rowSelection.value = parseSelectedQuery(savedSelected);
      }
    }
  }
});

onUnmounted(() => {
  if (marketHoursInterval) clearInterval(marketHoursInterval);
});

const allRates = computed(() => {
  const rates: any[] = [];

  if (usdRates.value && Array.isArray(usdRates.value)) {
    usdRates.value.forEach((rate) => {
      if (rate.bid && rate.ask) {
        rates.push({
          ...rate,
          currency: "USD",
          spread: getSpread(rate),
          spreadPercentage: getSpreadPercentage(rate),
          slug: rate.slug,
        });
      }
    });
  }

  const cryptoData = [
    { rates: usdcRates.value, currency: "USDC" },
    { rates: usdtRates.value, currency: "USDT" },
    { rates: btcRates.value, currency: "BTC" },
    { rates: ethRates.value, currency: "ETH" },
  ];

  cryptoData.forEach(({ rates: cryptoRates, currency }) => {
    if (cryptoRates && Array.isArray(cryptoRates)) {
      cryptoRates.forEach((rate) => {
        if (rate.bid && rate.ask) {
          rates.push({
            ...rate,
            currency,
            spread: getSpread(rate),
            spreadPercentage: getSpreadPercentage(rate),
            slug: rate.slug,
          });
        }
      });
    }
  });

  return rates;
});

const filteredRates = computed(() => {
  const currencyMatch = props.currency.toUpperCase();
  let rates = allRates.value.filter((rate) => rate.currency === currencyMatch);

  if (showOnly24x7.value && props.currency === "usd") {
    rates = rates.filter((rate) => rate.is24x7 === true);
  }

  if (props.currency === "usd") {
    rates = rates.filter((rate) => matchesUsdType(rate));
  }

  return rates;
});

const columns: TableColumn<any>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Seleccionar todo",
        color: "neutral",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Seleccionar fila",
        color: "neutral",
      }),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(
        "div",
        {
          class: "flex flex-row",
        },
        [
          h(UButton, {
            color: "neutral",
            variant: "ghost",
            label: "PROVEEDOR",
            icon: isSorted
              ? isSorted === "asc"
                ? "i-lucide-arrow-up-narrow-wide"
                : "i-lucide-arrow-down-wide-narrow"
              : "i-lucide-arrow-up-down",
          }),
        ],
      );
    },
  },
  {
    accessorKey: "ask",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: RATE_LABELS_UPPER.ask,
          icon: isSorted
            ? isSorted === "asc"
              ? "i-lucide-arrow-up-narrow-wide"
              : "i-lucide-arrow-down-wide-narrow"
            : "i-lucide-arrow-up-down",
          class: "-ml-auto",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        }),
      ]);
    },
  },
  {
    accessorKey: "bid",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: RATE_LABELS_UPPER.bid,
          icon: isSorted
            ? isSorted === "asc"
              ? "i-lucide-arrow-up-narrow-wide"
              : "i-lucide-arrow-down-wide-narrow"
            : "i-lucide-arrow-up-down",
          class: "-ml-auto",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        }),
      ]);
    },
  },
  {
    accessorKey: "spread",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "SPREAD",
          icon: isSorted
            ? isSorted === "asc"
              ? "i-lucide-arrow-up-narrow-wide"
              : "i-lucide-arrow-down-wide-narrow"
            : "i-lucide-arrow-up-down",
          class: "-ml-auto",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        }),
      ]);
    },
  },
  {
    accessorKey: "spreadPercentage",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "SPREAD %",
          icon: isSorted
            ? isSorted === "asc"
              ? "i-lucide-arrow-up-narrow-wide"
              : "i-lucide-arrow-down-wide-narrow"
            : "i-lucide-arrow-up-down",
          class: "-ml-auto",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        }),
      ]);
    },
  },
];

const hasValidSpread = (rate: any) => {
  return rate.ask != null && rate.ask > 0 && rate.bid != null && rate.bid > 0;
};

const getSpread = (rate: any) => {
  if (!hasValidSpread(rate)) return 0;
  return rate.ask - rate.bid;
};

const getSpreadPercentage = (rate: any) => {
  if (!hasValidSpread(rate)) return 0;
  const spread = getSpread(rate);
  const midPrice = (rate.ask + rate.bid) / 2;
  return (spread / midPrice) * 100;
};

const copyToClipboardHelper = async (
  content: string,
  successMessage: string,
) => {
  try {
    await navigator.clipboard.writeText(content);
    toast.add({
      title: successMessage,
      color: "success",
      icon: "i-lucide-check",
    });
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.add({
      title: successMessage,
      color: "success",
      icon: "i-lucide-check",
    });
  }
};

const downloadCSVHelper = (
  csvContent: string,
  filename: string,
  rowCount: number,
) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.add({
    title: "✓ CSV descargado",
    description: `${rowCount} fila(s) exportada(s) como CSV`,
    color: "success",
    icon: "i-lucide-download",
  });
};

const downloadCSV = () => {
  const headers = [
    "PROVIDER",
    "CURRENCY",
    RATE_LABELS_UPPER.ask,
    RATE_LABELS_UPPER.bid,
    "SPREAD",
    "SPREAD %",
  ];
  const csvData = filteredRates.value.map((rate) => [
    getProviderDisplayName(rate),
    rate.currency,
    rate.ask?.toFixed(2) || "0.00",
    rate.bid?.toFixed(2) || "0.00",
    getSpread(rate).toFixed(2),
    getSpreadPercentage(rate).toFixed(2),
  ]);

  const csvContent = [headers, ...csvData]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  downloadCSVHelper(
    csvContent,
    `rates-${props.currency.toUpperCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
    filteredRates.value.length,
  );
};

const copyToClipboard = async () => {
  const headers = [
    "PROVIDER",
    "CURRENCY",
    RATE_LABELS_UPPER.ask,
    RATE_LABELS_UPPER.bid,
    "SPREAD",
    "SPREAD %",
  ];
  const tableData = filteredRates.value.map((rate) => [
    getProviderDisplayName(rate),
    rate.currency,
    rate.ask?.toFixed(2) || "0.00",
    rate.bid?.toFixed(2) || "0.00",
    getSpread(rate).toFixed(2),
    getSpreadPercentage(rate).toFixed(2),
  ]);

  const clipboardContent = [headers, ...tableData]
    .map((row) => row.join("\t"))
    .join("\n");

  await copyToClipboardHelper(clipboardContent, "✓ ¡Copiado al portapapeles!");
};

const isLoading = computed(
  () =>
    usdLoading.value ||
    usdcLoading.value ||
    usdtLoading.value ||
    btcLoading.value ||
    ethLoading.value,
);

const sortableColumns = [
  { id: "spreadPercentage", label: "Spread %" },
  { id: "spread", label: RATE_LABELS.spread },
  { id: "ask", label: RATE_LABELS.ask },
  { id: "bid", label: RATE_LABELS.bid },
  { id: "name", label: "Proveedor" },
] as const;

const activeSortColumn = ref(
  sortableColumns.find((c) => c.id === (sorting.value[0]?.id ?? "spreadPercentage")) ??
    sortableColumns[0],
);
const activeSortDesc = ref(sorting.value[0]?.desc ?? false);

watch(activeSortColumn, (col) => {
  sorting.value = [{ id: col.id, desc: activeSortDesc.value }];
});

watch(activeSortDesc, (desc) => {
  if (sorting.value[0]) {
    sorting.value = [{ id: sorting.value[0].id, desc }];
  }
});

watch(sorting, (value) => {
  const col = value[0];
  if (!col) return;
  const found = sortableColumns.find((c) => c.id === col.id);
  if (found) activeSortColumn.value = found;
  activeSortDesc.value = col.desc;
});

const sortedFilteredRates = computed(() => {
  const items = [...filteredRates.value];
  const sortDef = sorting.value[0];
  if (!sortDef) return items;

  const { id, desc } = sortDef;

  return items.sort((a, b) => {
    if (id === "name") {
      const aName = getProviderDisplayName(a);
      const bName = getProviderDisplayName(b);
      return desc ? bName.localeCompare(aName) : aName.localeCompare(bName);
    }

    let aVal = a[id as keyof typeof a] as number | null | undefined;
    let bVal = b[id as keyof typeof b] as number | null | undefined;

    if (aVal == null) {
      aVal = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    }
    if (bVal == null) {
      bVal = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    }

    return desc ? bVal - aVal : aVal - bVal;
  });
});

const formatPrice = (value: number | null | undefined) =>
  (value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const isRowSelected = (slug: string) => !!rowSelection.value[slug];

const setRowSelected = (slug: string, value: boolean | "indeterminate") => {
  rowSelection.value = {
    ...rowSelection.value,
    [slug]: !!value,
  };
};

// Load saved state when currency changes
watch(
  () => props.currency,
  () => {
    const { savedSort, savedSelected } = loadSavedState(props.currency);

    // Load state for new currency from localStorage if no URL params
    if (!sortQuery.value) {
      sorting.value = parseSortQuery(savedSort || null);
    }

    if (!selectedQuery.value) {
      rowSelection.value = parseSelectedQuery(savedSelected || null);
    } else {
      rowSelection.value = {};
    }
  },
);

defineExpose({
  filteredRates,
  isLoading,
});
</script>

<template>
  <div class="w-full space-y-4">
    <div
      v-if="isLoading"
      :class="`border rounded ${terminalColors.tableBorder} overflow-hidden`"
    >
      <div class="divide-y divide-zinc-200 dark:divide-zinc-700">
        <div
          class="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-4"
        >
          <USkeleton class="h-4 w-4" />
          <USkeleton class="h-4 w-24" />
          <div class="flex-1"></div>
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
        </div>
        <div v-for="i in 12" :key="i" class="px-4 py-3 flex items-center gap-4">
          <USkeleton class="h-4 w-4" />
          <USkeleton class="h-4 w-4 rounded" />
          <USkeleton class="h-4 w-32" />
          <div class="flex-1"></div>
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-16" />
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredRates.length === 0"
      :class="`${terminalColors.text} font-mono text-center space-y-4`"
    >
      <div>No hay datos disponibles para {{ currency.toUpperCase() }}</div>
    </div>

    <template v-else>
      <!-- Vista mobile: cards con estética terminal -->
      <div :class="`space-y-3 font-mono lg:hidden ${terminalColors.text}`">
        <div class="flex items-center gap-2">
          <USelect
            v-model="activeSortColumn"
            :items="[...sortableColumns]"
            value-key="id"
            label-key="label"
            placeholder="SORT BY"
            aria-label="Ordenar por"
            size="sm"
            class="min-w-0 flex-1 font-mono"
            :ui="{
              base: `rounded-none ${terminalColors.tableBorder}`,
            }"
          />
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-none font-mono"
            :class="terminalColors.tableBorder"
            :icon="
              activeSortDesc
                ? 'i-lucide-arrow-down-narrow-wide'
                : 'i-lucide-arrow-up-narrow-wide'
            "
            :aria-label="
              activeSortDesc
                ? 'Orden descendente, cambiar a ascendente'
                : 'Orden ascendente, cambiar a descendente'
            "
            @click="activeSortDesc = !activeSortDesc"
          />
        </div>

        <div class="space-y-2">
          <div
            v-for="rate in sortedFilteredRates"
            :key="rate.slug"
            class="border bg-default p-3 transition-colors"
            :class="[
              terminalColors.tableBorder,
              terminalColors.tableHover,
              isRowSelected(rate.slug)
                ? `ring-1 ${terminalColors.ring}`
                : undefined,
            ]"
          >
            <div class="mb-3 flex items-start gap-2.5">
              <UCheckbox
                :model-value="isRowSelected(rate.slug)"
                color="neutral"
                aria-label="Seleccionar fila"
                class="mt-1"
                @update:model-value="setRowSelected(rate.slug, $event)"
              />
              <NuxtLink
                :to="`/${currency}/${rate.slug}`"
                class="group -m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-sm p-1 transition-colors"
                :class="terminalColors.tableHover"
              >
                <img
                  v-if="rate.logoUrl"
                  :src="getResizedImageUrl(rate.logoUrl, 32)"
                  :alt="getProviderDisplayName(rate)"
                  width="32"
                  height="32"
                  class="size-8 shrink-0 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="flex size-8 shrink-0 items-center justify-center border text-[10px] font-bold"
                  :class="[terminalColors.tableBorder, terminalColors.text]"
                >
                  {{ getProviderDisplayName(rate).slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p
                    :class="`truncate text-sm font-semibold uppercase tracking-tight group-hover:underline ${terminalColors.cellText}`"
                  >
                    {{ getProviderDisplayName(rate) }}
                  </p>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5">
                    <UsdTypeBadge
                      :usd-type="rate.usdType"
                      :slug="rate.slug"
                      :name="rate.name"
                    />
                    <UBadge v-if="rate.isUsdCcl" color="info" size="xs">
                      CCL
                    </UBadge>
                    <UIcon
                      v-if="!rate.is24x7 && !marketHours"
                      name="i-heroicons-moon"
                      :class="`size-3.5 ${terminalColors.blue}`"
                      title="Mercado cerrado"
                    />
                  </div>
                </div>
              </NuxtLink>
            </div>

            <div class="grid grid-cols-2 gap-1.5 text-xs">
              <div
                class="flex flex-col gap-1 border px-2 py-1.5"
                :class="terminalColors.tableBorder"
              >
                <span
                  :class="`text-[10px] uppercase tracking-wider ${terminalColors.textSecondary}`"
                >
                  {{ RATE_LABELS_UPPER.ask }}
                </span>
                <span
                  :class="`self-end text-sm font-semibold tabular-nums ${terminalColors.cellText}`"
                >
                  ${{ formatPrice(rate.ask) }}
                </span>
                <NuxtLink
                  :to="`/${currency}/${rate.slug}`"
                  class="self-end"
                  :aria-label="`Ver detalle de ${getProviderDisplayName(rate)}`"
                >
                  <ClientOnly>
                    <RateSparkline
                      :values="getTrendSeries(rate.slug, 'buy')"
                      :show-range-labels="false"
                      :width="64"
                      :height="22"
                    />
                  </ClientOnly>
                </NuxtLink>
              </div>
              <div
                class="flex flex-col gap-1 border px-2 py-1.5"
                :class="terminalColors.tableBorder"
              >
                <span
                  :class="`text-[10px] uppercase tracking-wider ${terminalColors.textSecondary}`"
                >
                  {{ RATE_LABELS_UPPER.bid }}
                </span>
                <span
                  :class="`self-end text-sm font-semibold tabular-nums ${terminalColors.cellText}`"
                >
                  ${{ formatPrice(rate.bid) }}
                </span>
                <NuxtLink
                  :to="`/${currency}/${rate.slug}`"
                  class="self-end"
                  :aria-label="`Ver detalle de ${getProviderDisplayName(rate)}`"
                >
                  <ClientOnly>
                    <RateSparkline
                      :values="getTrendSeries(rate.slug, 'sell')"
                      :show-range-labels="false"
                      :width="64"
                      :height="22"
                    />
                  </ClientOnly>
                </NuxtLink>
              </div>
              <div
                class="flex items-center border px-2 py-1.5"
                :class="terminalColors.tableBorder"
              >
                <span
                  :class="`text-[10px] uppercase tracking-wider ${terminalColors.textSecondary}`"
                >
                  {{ RATE_LABELS_UPPER.spread }}
                </span>
                <span
                  :class="`ml-auto text-xs font-semibold tabular-nums ${terminalColors.cellTextYellow}`"
                >
                  ${{ formatPrice(getSpread(rate)) }}
                </span>
              </div>
              <div
                class="flex items-center border px-2 py-1.5"
                :class="terminalColors.tableBorder"
              >
                <span
                  :class="`text-[10px] uppercase tracking-wider ${terminalColors.textSecondary}`"
                >
                  SPREAD %
                </span>
                <span
                  :class="`ml-auto text-xs font-semibold tabular-nums ${terminalColors.cellTextYellow}`"
                >
                  {{ getSpreadPercentage(rate).toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista desktop: tabla actual -->
      <div
        :class="`hidden w-full overflow-clip rounded border bg-default lg:block ${terminalColors.tableBorder}`"
      >
        <UTable
          ref="table"
          v-model:sorting="sorting"
          v-model:row-selection="rowSelection"
          sticky="header"
          :data="filteredRates"
          :columns="columns"
          :get-row-id="(row) => row.slug"
          :ui="{
            root: 'overflow-visible',
            thead:
              'sticky top-(--ui-header-height) z-20 border-b border-default bg-default/75 backdrop-blur',
            separator: 'hidden',
            tr: `${terminalColors.tableBorder} ${terminalColors.tableHover} data-[selected=true]:bg-zinc-200/50    dark:data-[selected=true]:bg-zinc-700/50`,
            th: 'py-1',
          }"
        >
          <template #name-cell="{ row }">
            <NuxtLink
              :to="`/${currency}/${row.original.slug}`"
              class="flex items-center gap-2 hover:underline"
            >
              <img
                v-if="row.original.logoUrl"
                :src="getResizedImageUrl(row.original.logoUrl, 16)"
                :alt="getProviderDisplayName(row.original)"
                width="16"
                height="16"
                class="w-4 h-4"
                loading="lazy"
                decoding="async"
              />
              <span :class="terminalColors.cellText">
                {{ getProviderDisplayName(row.original) }}
              </span>
              <UsdTypeBadge
                :usd-type="row.original.usdType"
                :slug="row.original.slug"
                :name="row.original.name"
              />
              <UBadge v-if="row.original.isUsdCcl" color="info" size="xs">
                CCL
              </UBadge>
              <UIcon
                v-if="!row.original.is24x7 && !marketHours"
                name="i-heroicons-moon"
                :class="`w-3 h-3 ${terminalColors.blue}`"
                title="Mercado cerrado"
              />
            </NuxtLink>
          </template>

          <template #bid-cell="{ row }">
            <div class="flex flex-col items-end gap-1">
              <div :class="`text-right font-mono ${terminalColors.cellText}`">
                ${{ formatPrice(row.original.bid) }}
              </div>
              <NuxtLink
                :to="`/${currency}/${row.original.slug}`"
                :aria-label="`Ver detalle de ${getProviderDisplayName(row.original)}`"
              >
                <ClientOnly>
                  <RateSparkline
                    :values="getTrendSeries(row.original.slug, 'sell')"
                  />
                </ClientOnly>
              </NuxtLink>
            </div>
          </template>

          <template #ask-cell="{ row }">
            <div class="flex flex-col items-end gap-1">
              <div :class="`text-right font-mono ${terminalColors.cellText}`">
                ${{ formatPrice(row.original.ask) }}
              </div>
              <NuxtLink
                :to="`/${currency}/${row.original.slug}`"
                :aria-label="`Ver detalle de ${getProviderDisplayName(row.original)}`"
              >
                <ClientOnly>
                  <RateSparkline
                    :values="getTrendSeries(row.original.slug, 'buy')"
                  />
                </ClientOnly>
              </NuxtLink>
            </div>
          </template>

          <template #spread-cell="{ row }">
            <div
              :class="`text-right font-mono ${terminalColors.cellTextYellow}`"
            >
              ${{ formatPrice(getSpread(row.original)) }}
            </div>
          </template>

          <template #spreadPercentage-cell="{ row }">
            <div
              :class="`text-right font-mono ${terminalColors.cellTextYellow}`"
            >
              {{ getSpreadPercentage(row.original).toFixed(2) }}%
            </div>
          </template>
        </UTable>
      </div>
    </template>

    <div
      v-if="currency === 'usd'"
      class="sticky bottom-4 z-10 flex justify-center pointer-events-none"
    >
      <div>
        <USwitch
          v-model="showOnly24x7"
          label="Solo proveedores 24/7"
          size="sm"
          :ui="{
            root: 'pointer-events-auto bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center px-4',
            label: 'py-2',
          }"
        />
      </div>
    </div>

    <div class="flex justify-between items-center gap-2">
      <div class="flex gap-2">
        <UButton
          v-if="
            Object.keys(rowSelection).length > 0 ||
            sorting[0]?.id !== 'spreadPercentage' ||
            sorting[0]?.desc !== false
          "
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-refresh-ccw"
          class="font-mono text-error-800 dark:text-error-200"
          @click="resetState"
        >
          Resetear estado
        </UButton>
      </div>

      <div class="flex gap-2 ml-auto">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          class="font-mono"
          @click="copyToClipboard"
        >
          Copiar Todo
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          class="font-mono"
          @click="downloadCSV"
        >
          Descargar Todo CSV
        </UButton>
      </div>
    </div>
  </div>
</template>
