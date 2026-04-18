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
import type { TableColumn } from "@nuxt/ui";
import { use24x7Filter } from "@/composables/use24x7Filter";
import { useTerminalColors } from "@/composables/useTerminalColors";
import { useRouteQuery } from "@vueuse/router";

interface Props {
  currency: CurrencyType;
}

const props = defineProps<Props>();

const toast = useToast();
const marketHours = ref(true);
const { showOnly24x7 } = use24x7Filter();
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

// Initialize state from URL params or localStorage
const { savedSort, savedSelected } = loadSavedState(props.currency);
const sorting = ref(parseSortQuery(sortQuery.value || savedSort || null));

const selectedQuery = useRouteQuery<string | null>("selected", null);
const rowSelection = ref(
  parseSelectedQuery(selectedQuery.value || savedSelected || null),
);

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

const usdCclRates = computed(() => {
  if (!usdRates.value || !Array.isArray(usdRates.value)) return [];
  return usdRates.value.filter((rate) => rate.isUsdCcl === true);
});

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
    }
    if (selectedQuery.value) {
      rowSelection.value = parseSelectedQuery(selectedQuery.value);
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
      if (rate.isUsdCcl) return;
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

  if (usdCclRates.value && Array.isArray(usdCclRates.value)) {
    usdCclRates.value.forEach((rate) => {
      if (rate.bid && rate.ask) {
        rates.push({
          ...rate,
          currency: "USD-CCL",
          spread: getSpread(rate),
          spreadPercentage: getSpreadPercentage(rate),
          slug: rate.slug,
        });
      }
    });
  }

  return rates;
});

const filteredRates = computed(() => {
  const currencyMatch =
    props.currency === "usd-ccl" ? "USD-CCL" : props.currency.toUpperCase();
  let rates = allRates.value.filter((rate) => rate.currency === currencyMatch);

  if (showOnly24x7.value && props.currency === "usd") {
    rates = rates.filter((rate) => rate.is24x7 === true);
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
    accessorKey: "bid",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "COMPRA",
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
    accessorKey: "ask",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h("div", { class: "flex flex-row justify-end" }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "VENTA",
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
  const headers = ["PROVIDER", "CURRENCY", "BUY", "SELL", "SPREAD", "SPREAD %"];
  const csvData = filteredRates.value.map((rate) => [
    rate.prettyName || rate.name,
    rate.currency,
    rate.bid?.toFixed(2) || "0.00",
    rate.ask?.toFixed(2) || "0.00",
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
  const headers = ["PROVIDER", "CURRENCY", "BUY", "SELL", "SPREAD", "SPREAD %"];
  const tableData = filteredRates.value.map((rate) => [
    rate.prettyName || rate.name,
    rate.currency,
    rate.bid?.toFixed(2) || "0.00",
    rate.ask?.toFixed(2) || "0.00",
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

    <div v-else class="w-full">
      <UTable
        ref="table"
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        :data="filteredRates"
        :columns="columns"
        :get-row-id="(row) => row.slug"
        role="table"
        :ui="{
          root: `border rounded ${terminalColors.tableBorder}`,
          tr: `${terminalColors.tableBorder} ${terminalColors.tableHover} data-[selected=true]:bg-zinc-200/50    dark:data-[selected=true]:bg-zinc-700/50`,
        }"
      >
        <template #name-cell="{ row }">
          <NuxtLink
            :to="`/${currency}/${row.original.slug}`"
            class="flex items-center gap-2 hover:underline"
          >
            <img
              v-if="row.original.logoUrl"
              :src="row.original.logoUrl"
              :alt="row.original.prettyName || row.original.name"
              class="w-4 h-4"
            />
            <span :class="terminalColors.cellText">
              {{ row.original.prettyName || row.original.name }}
            </span>
            <RateVariationBadge :value="row.original.pct_variation" />
            <UIcon
              v-if="!row.original.is24x7 && !marketHours"
              name="i-heroicons-moon"
              :class="`w-3 h-3 ${terminalColors.blue}`"
              title="Mercado cerrado"
            />
          </NuxtLink>
        </template>

        <template #bid-cell="{ row }">
          <div :class="`text-right font-mono ${terminalColors.cellText}`">
            ${{
              (row.original.bid || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </div>
        </template>

        <template #ask-cell="{ row }">
          <div :class="`text-right font-mono ${terminalColors.cellText}`">
            ${{
              (row.original.ask || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </div>
        </template>

        <template #spread-cell="{ row }">
          <div :class="`text-right font-mono ${terminalColors.cellTextYellow}`">
            ${{
              getSpread(row.original).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </div>
        </template>

        <template #spreadPercentage-cell="{ row }">
          <div :class="`text-right font-mono ${terminalColors.cellTextYellow}`">
            {{ getSpreadPercentage(row.original).toFixed(2) }}%
          </div>
        </template>
      </UTable>
    </div>

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
