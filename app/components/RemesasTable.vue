<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useMediaQuery } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";
import { RATE_DISPLAY } from "~/lib/rate-labels";
import {
  formatArsAmount,
  hasPositiveNumericValue,
  isZeroLike,
  simulateRemesaPayout,
} from "~/lib/remesas";
import { getDetail, type RemesaRow } from "~/composables/useRemesasRows";

interface SimulatedRemesaRow extends RemesaRow {
  arsFinal: number | null;
  arsFinalSort: number;
}

const props = defineProps<{
  rows: RemesaRow[];
}>();

const { usdAmount, isSimulating } = useRemesasSimulator();
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UPopover = resolveComponent("UPopover");

const { trackProviderClick } = useAnalytics();
const hasHover = useMediaQuery("(hover: hover)");
const isMobile = useMediaQuery("(max-width: 1023px)");

function handleProviderClick(row: RemesaRow) {
  if (!row.providerUrl) return;
  trackProviderClick({
    providerName: row.displayName,
    providerUrl: row.providerUrl,
    section: "remesas",
  });
}

function renderDetailPopover(
  detail: string | null | undefined,
  title = "Detalle",
) {
  if (!detail) return null;

  return h(
    UPopover,
    {
      mode: hasHover.value ? "hover" : "click",
      openDelay: 80,
      closeDelay: 300,
      content: { side: "top", sideOffset: 8 },
      ui: { content: "max-w-sm whitespace-normal text-left p-3" },
    },
    {
      default: () =>
        h(
          "span",
          {
            class:
              "inline-flex cursor-help items-center gap-1 rounded-full border border-neutral-200 p-0.5 text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400",
          },
          [h(UIcon, { name: "i-lucide-info", class: "size-3" })],
        ),
      content: () =>
        h("div", { class: "space-y-1" }, [
          h("p", { class: "text-xs font-semibold" }, title),
          h("p", { class: "text-xs leading-5 text-muted" }, detail),
        ]),
    },
  );
}

function renderBooleanCell(value: boolean, detail?: string) {
  return h("div", { class: "min-w-0" }, [
    h("div", { class: "flex items-center gap-2" }, [
      h(
        UBadge,
        {
          color: value ? "success" : "error",
          variant: "soft",
          size: "md",
          class: "gap-1.5",
        },
        {
          default: () => [
            h(UIcon, {
              name: value ? "i-lucide-check" : "i-lucide-x",
              class: "size-3.5",
            }),
            value ? "Sí" : "No",
          ],
        },
      ),
      detail ? renderDetailPopover(detail) : null,
    ]),
  ]);
}

function renderCostCell(value: string | null, detail?: string) {
  const displayValue = value ?? "N/A";
  const badgeColor = !value
    ? "neutral"
    : isZeroLike(value)
      ? "success"
      : hasPositiveNumericValue(value)
        ? "error"
        : "neutral";

  return h("div", { class: "min-w-0" }, [
    h("div", { class: "flex items-center gap-2" }, [
      h(
        UBadge,
        {
          color: badgeColor,
          variant: badgeColor === "neutral" ? "outline" : "soft",
          size: "md",
          class: "font-semibold",
        },
        { default: () => displayValue },
      ),
      detail ? renderDetailPopover(detail) : null,
    ]),
  ]);
}

function renderVendesACell(row: RemesaRow) {
  const priceNode =
    row.vendesA != null && row.vendesAPath
      ? h(
          resolveComponent("NuxtLink"),
          {
            to: row.vendesAPath,
            class: [
              "font-mono text-sm font-semibold hover:underline",
              RATE_DISPLAY.bid.textClass,
              RATE_DISPLAY.bid.darkTextClass,
            ].join(" "),
          },
          () => row.vendesALabel,
        )
      : h(
          "span",
          {
            class:
              row.vendesA == null
                ? "text-sm text-muted"
                : [
                    "font-mono text-sm font-semibold",
                    RATE_DISPLAY.bid.textClass,
                    RATE_DISPLAY.bid.darkTextClass,
                  ].join(" "),
          },
          row.vendesALabel,
        );

  return h("div", { class: "min-w-0" }, [
    h("div", { class: "flex items-center gap-2" }, [
      priceNode,
      row.vendesADetail
        ? renderDetailPopover(row.vendesADetail, RATE_DISPLAY.bid.label)
        : null,
    ]),
  ]);
}

function renderArsFinalCell(row: SimulatedRemesaRow) {
  if (row.arsFinal == null) {
    return h("span", { class: "text-muted" }, "—");
  }

  return h(
    "span",
    {
      class:
        "font-mono text-sm font-semibold tabular-nums text-green-700 dark:text-green-400",
    },
    formatArsAmount(row.arsFinal),
  );
}

const simulatedRows = computed<SimulatedRemesaRow[]>(() => {
  return props.rows.map((row) => {
    if (!isSimulating.value || row.vendesA == null) {
      return {
        ...row,
        arsFinal: null,
        arsFinalSort: Number.NEGATIVE_INFINITY,
      };
    }

    const payout = simulateRemesaPayout({
      usdAmount: usdAmount.value ?? 0,
      bid: row.vendesA,
      costoRecibirPagos: row.costoRecibirPagos,
      retiroArs: row.retiroArs,
    });

    return {
      ...row,
      arsFinal: payout?.arsFinal ?? null,
      arsFinalSort: payout?.arsFinal ?? Number.NEGATIVE_INFINITY,
    };
  });
});

function renderProviderCell(row: RemesaRow) {
  const avatar = row.logo
    ? h("img", {
        src: row.logo,
        alt: `${row.displayName} logo`,
        class: "size-9 rounded-full object-contain",
        loading: "lazy",
      })
    : h(
        "div",
        {
          class:
            "flex size-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
        },
        row.initials,
      );

  const content = h("div", { class: "min-w-0" }, [
    h(
      "p",
      {
        class: row.providerUrl
          ? "font-medium text-neutral-600 group-hover:underline dark:text-neutral-400"
          : "font-medium",
      },
      row.displayName,
    ),
  ]);

  if (row.providerUrl) {
    return h(
      "a",
      {
        href: row.providerUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        class:
          "group -m-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
        onClick: () => handleProviderClick(row),
      },
      [avatar, content],
    );
  }

  return h("div", { class: "flex items-center gap-3" }, [avatar, content]);
}

function createSortableHeader(label: string) {
  return ({ column }: { column: any }) => {
    const isSorted = column.getIsSorted();
    return h(UButton, {
      color: "neutral",
      variant: "ghost",
      label,
      icon: isSorted
        ? isSorted === "asc"
          ? "i-lucide-arrow-up-narrow-wide"
          : "i-lucide-arrow-down-wide-narrow"
        : "i-lucide-arrow-up-down",
      class: "-mx-2.5 font-semibold",
      onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    });
  };
}

const searchQuery = useRouteQuery("q", "");
const monedaFilter = useRouteQuery("moneda", "all");
const cuentaPropiaFilter = useRouteQuery("propia", "all");
const inversionesFilter = useRouteQuery("inv", "all");
const tarjetaFilter = useRouteQuery("tarjeta", "all");
const sortQuery = useRouteQuery("sort", '[{"id":"vendesASort","desc":true}]');

type SortingState = Array<{ id: string; desc: boolean }>;

const DEFAULT_SORT: SortingState = [{ id: "vendesASort", desc: true }];

function parseSorting(value: string): SortingState {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : DEFAULT_SORT;
  } catch {
    return DEFAULT_SORT;
  }
}

function sanitizeSorting(
  value: SortingState,
  simulating: boolean,
): SortingState {
  const next = value.filter((item) => {
    if (!item?.id) return false;
    if (item.id === "arsFinalSort") return simulating;
    return true;
  });
  return next.length ? next : DEFAULT_SORT;
}

const sorting = ref<SortingState>(
  sanitizeSorting(parseSorting(sortQuery.value), isSimulating.value),
);

const columnVisibility = computed(() => ({
  arsFinalSort: isSimulating.value,
}));

watch(sortQuery, (value) => {
  const next = sanitizeSorting(parseSorting(value), isSimulating.value);
  if (JSON.stringify(next) !== JSON.stringify(sorting.value)) {
    sorting.value = next;
  }
});

watch(
  sorting,
  (value) => {
    const serialized = JSON.stringify(value ?? []);
    if (sortQuery.value !== serialized) {
      sortQuery.value = serialized;
    }
  },
  { deep: true },
);

function matchBooleanFilter(filter: string, value: boolean): boolean {
  return (
    filter === "all" ||
    (filter === "si" && value) ||
    (filter === "no" && !value)
  );
}

function normalizeText(value: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

const filteredRows = computed(() => {
  const query = normalizeText(searchQuery.value);

  return simulatedRows.value.filter((row) => {
    if (monedaFilter.value !== "all" && row.moneda !== monedaFilter.value) {
      return false;
    }
    if (!matchBooleanFilter(cuentaPropiaFilter.value, row.cuentaPropia)) {
      return false;
    }
    if (!matchBooleanFilter(inversionesFilter.value, row.inversiones)) {
      return false;
    }
    if (!matchBooleanFilter(tarjetaFilter.value, row.tarjetaUsa)) {
      return false;
    }
    if (!query) return true;

    return [
      row.displayName,
      row.monedaLabel,
      row.costoRecibirPagos,
      row.costoMantenimientoTarjeta,
      row.costoTarjeta,
      row.retiroArs,
      row.vendesALabel,
      ...Object.values(row.detalles ?? {}),
    ]
      .map((value) => normalizeText(value))
      .some((value) => value.includes(query));
  });
});

const sortedFilteredRows = computed(() => {
  const items = [...filteredRows.value];
  const sortDef = sorting.value[0];
  if (!sortDef) return items;

  const id = sortDef.id;
  const desc = sortDef.desc;

  return items.sort((a, b) => {
    let aVal: any = a[id as keyof RemesaRow];
    let bVal: any = b[id as keyof RemesaRow];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }

    if (aVal == null)
      aVal = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    if (bVal == null)
      bVal = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    return desc ? bVal - aVal : aVal - bVal;
  });
});

const sortableColumns = computed(() => [
  ...(isSimulating.value ? [{ id: "arsFinalSort", label: "Te quedan" }] : []),
  { id: "vendesASort", label: RATE_DISPLAY.bid.label },
  { id: "retiroArsSort", label: "Retiro ARS" },
  { id: "costoRecibirPagosSort", label: "Recibir pagos" },
  { id: "costoMantenimientoTarjetaSort", label: "Mant. tarjeta" },
  { id: "costoTarjetaSort", label: "Uso tarjeta" },
  { id: "averageRating", label: "Rating" },
  { id: "displayName", label: "Nombre" },
]);

const activeSortColumn = ref(
  sortableColumns.value.find(
    (c) => c.id === (sorting.value[0]?.id ?? "vendesASort"),
  ) ?? sortableColumns.value[0]!,
);
const activeSortDesc = ref(sorting.value[0]?.desc ?? true);

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
  if (col) {
    const found = sortableColumns.value.find((c) => c.id === col.id);
    if (found) activeSortColumn.value = found;
    activeSortDesc.value = col.desc;
  }
});

watch(isSimulating, (simulating) => {
  if (simulating) {
    sorting.value = [{ id: "arsFinalSort", desc: true }];
    return;
  }
  if (sorting.value[0]?.id === "arsFinalSort") {
    sorting.value = [{ id: "vendesASort", desc: true }];
  }
});

const columns = computed<TableColumn<SimulatedRemesaRow>[]>(() => [
  {
    accessorKey: "displayName",
    header: createSortableHeader("Plataforma"),
    cell: ({ row }) => renderProviderCell(row.original),
  },
  {
    accessorKey: "cuentaPropia",
    header: createSortableHeader("Cuenta propia"),
    cell: ({ row }) =>
      renderBooleanCell(
        row.original.cuentaPropia,
        getDetail(row.original.detalles, "cuentaPropia"),
      ),
  },
  {
    accessorKey: "inversiones",
    header: createSortableHeader("Inversiones"),
    cell: ({ row }) =>
      renderBooleanCell(
        row.original.inversiones,
        getDetail(row.original.detalles, "inversiones"),
      ),
  },
  {
    accessorKey: "tarjetaUsa",
    header: createSortableHeader("Tarjeta EEUU"),
    cell: ({ row }) =>
      renderBooleanCell(
        row.original.tarjetaUsa,
        getDetail(row.original.detalles, "tarjetaUsa"),
      ),
  },
  {
    accessorKey: "costoRecibirPagosSort",
    header: createSortableHeader("Recibir pagos"),
    cell: ({ row }) =>
      renderCostCell(
        row.original.costoRecibirPagos,
        getDetail(row.original.detalles, "costoRecibirPagos"),
      ),
  },
  {
    accessorKey: "retiroArsSort",
    header: createSortableHeader("Retiro ARS"),
    cell: ({ row }) =>
      renderCostCell(
        row.original.retiroArs,
        getDetail(row.original.detalles, "retiroArs"),
      ),
  },
  {
    accessorKey: "vendesASort",
    header: createSortableHeader(RATE_DISPLAY.bid.label),
    cell: ({ row }) => renderVendesACell(row.original),
  },
  {
    accessorKey: "arsFinalSort",
    header: createSortableHeader("Te quedan"),
    cell: ({ row }) => renderArsFinalCell(row.original),
  },
  {
    accessorKey: "costoMantenimientoTarjetaSort",
    header: createSortableHeader("Mant. tarjeta"),
    cell: ({ row }) =>
      renderCostCell(
        row.original.costoMantenimientoTarjeta,
        getDetail(row.original.detalles, "costoMantenimientoTarjeta"),
      ),
  },
  {
    accessorKey: "costoTarjetaSort",
    header: createSortableHeader("Uso tarjeta"),
    cell: ({ row }) =>
      renderCostCell(
        row.original.costoTarjeta,
        getDetail(row.original.detalles, "costoTarjeta"),
      ),
  },
  {
    accessorKey: "averageRating",
    header: createSortableHeader("Rating promedio"),
    cell: ({ row }) => row.original.averageRatingLabel,
  },
]);
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-3">
        <h2 class="text-lg font-semibold">Tabla comparativa</h2>
        <div class="grid gap-4 xl:grid-cols-[minmax(0,320px)_1fr]">
          <UFormField label="Buscar plataforma">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="ARQ, Wallbit, AstroPay..."
            />
          </UFormField>

          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Moneda
              </p>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="option in ['all', 'FIAT', 'CRIPTO']"
                  :key="option"
                  size="sm"
                  :color="monedaFilter === option ? 'neutral' : 'neutral'"
                  :variant="monedaFilter === option ? 'soft' : 'outline'"
                  @click="monedaFilter = option"
                >
                  {{
                    option === "all"
                      ? "Todas"
                      : option === "FIAT"
                        ? "Fiat"
                        : "Cripto"
                  }}
                </UButton>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Cuenta propia
              </p>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="option in ['all', 'si', 'no']"
                  :key="`propia-${option}`"
                  size="sm"
                  :color="cuentaPropiaFilter === option ? 'neutral' : 'neutral'"
                  :variant="cuentaPropiaFilter === option ? 'soft' : 'outline'"
                  @click="cuentaPropiaFilter = option"
                >
                  {{
                    option === "all" ? "Todas" : option === "si" ? "Sí" : "No"
                  }}
                </UButton>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Inversiones
              </p>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="option in ['all', 'si', 'no']"
                  :key="`inv-${option}`"
                  size="sm"
                  color="neutral"
                  :variant="inversionesFilter === option ? 'soft' : 'outline'"
                  @click="inversionesFilter = option"
                >
                  {{
                    option === "all" ? "Todas" : option === "si" ? "Sí" : "No"
                  }}
                </UButton>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Tarjeta EEUU
              </p>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="option in ['all', 'si', 'no']"
                  :key="`tarjeta-${option}`"
                  size="sm"
                  :color="tarjetaFilter === option ? 'neutral' : 'neutral'"
                  :variant="tarjetaFilter === option ? 'soft' : 'outline'"
                  @click="tarjetaFilter = option"
                >
                  {{
                    option === "all" ? "Todas" : option === "si" ? "Sí" : "No"
                  }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs text-muted">
          <strong>{{ RATE_DISPLAY.bid.label }}</strong> es el precio de venta
          del dólar en vivo. Si hay aclaraciones, aparecen como
          <strong>Detalle</strong> en la celda.
        </p>
        <RemesasSimulator />
      </div>
    </template>

    <UAlert
      v-if="filteredRows.length === 0"
      color="warning"
      variant="soft"
      title="Sin resultados"
      description="Probá aflojar algún filtro o limpiar la búsqueda."
      class="mb-4"
    />

    <div class="hidden lg:block overflow-x-auto">
      <UTable
        v-model:sorting="sorting"
        :data="filteredRows"
        :columns="columns"
        :column-visibility="columnVisibility"
      >
        <template #empty>
          <div class="py-10 text-center text-sm text-muted">
            No hay plataformas que coincidan con los filtros actuales.
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="isMobile" class="space-y-4 lg:hidden">
      <div class="flex items-center gap-3">
        <USelect
          v-model="activeSortColumn"
          :items="sortableColumns"
          value-key="id"
          label-key="label"
          placeholder="Ordenar por"
          size="sm"
          class="min-w-0 flex-1"
        />
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          :icon="
            activeSortDesc
              ? 'i-lucide-arrow-down-narrow-wide'
              : 'i-lucide-arrow-up-narrow-wide'
          "
          @click="activeSortDesc = !activeSortDesc"
        />
      </div>

      <div class="space-y-3">
        <div
          v-for="row in sortedFilteredRows"
          :key="row.compania"
          class="rounded-xl border border-default bg-default p-4"
        >
          <div class="mb-3 flex items-center gap-3">
            <a
              v-if="row.providerUrl"
              :href="row.providerUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group -m-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              @click="handleProviderClick(row)"
            >
              <img
                v-if="row.logo"
                :src="row.logo"
                :alt="`${row.displayName} logo`"
                class="size-10 rounded-full object-contain"
                loading="lazy"
              />
              <div
                v-else
                class="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {{ row.initials }}
              </div>
              <div class="min-w-0">
                <p
                  class="font-medium text-neutral-600 group-hover:underline dark:text-neutral-400"
                >
                  {{ row.displayName }}
                </p>
              </div>
            </a>
            <template v-else>
              <img
                v-if="row.logo"
                :src="row.logo"
                :alt="`${row.displayName} logo`"
                class="size-10 rounded-full object-contain"
                loading="lazy"
              />
              <div
                v-else
                class="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {{ row.initials }}
              </div>
              <div>
                <p class="font-medium">{{ row.displayName }}</p>
              </div>
            </template>
            <div class="ml-auto shrink-0">
              <UBadge color="neutral" variant="outline" size="sm">
                {{ row.averageRatingLabel }}
              </UBadge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Cuenta propia</span>
              <span class="ml-auto" />
              <UBadge
                :color="row.cuentaPropia ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.cuentaPropiaLabel }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Inversiones</span>
              <span class="ml-auto" />
              <UBadge
                :color="row.inversiones ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.inversionesLabel }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Tarjeta EEUU</span>
              <span class="ml-auto" />
              <UBadge
                :color="row.tarjetaUsa ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.tarjetaUsaLabel }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Recibir pagos</span>
              <span class="ml-auto" />
              <UBadge
                :color="row.zeroReceiveCost ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.costoRecibirPagos ?? "N/A" }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Retiro ARS</span>
              <span class="ml-auto" />
              <UBadge
                :color="row.zeroArsWithdrawal ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.retiroArs ?? "N/A" }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">{{ RATE_DISPLAY.bid.label }}</span>
              <span class="ml-auto" />
              <NuxtLink
                v-if="row.vendesA != null && row.vendesAPath"
                :to="row.vendesAPath"
                class="font-mono text-xs font-semibold hover:underline"
                :class="[
                  RATE_DISPLAY.bid.textClass,
                  RATE_DISPLAY.bid.darkTextClass,
                ]"
              >
                {{ row.vendesALabel }}
              </NuxtLink>
              <span
                v-else
                class="text-xs"
                :class="
                  row.vendesA == null
                    ? 'text-muted'
                    : [
                        RATE_DISPLAY.bid.textClass,
                        RATE_DISPLAY.bid.darkTextClass,
                      ]
                "
              >
                {{ row.vendesALabel }}
              </span>
            </div>
            <div
              v-if="isSimulating"
              class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5"
            >
              <span class="text-muted">Te quedan</span>
              <span class="ml-auto" />
              <span
                class="font-mono text-xs font-semibold tabular-nums text-green-700 dark:text-green-400"
              >
                {{ row.arsFinal != null ? formatArsAmount(row.arsFinal) : "—" }}
              </span>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Mant. tarjeta</span>
              <span class="ml-auto" />
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.costoMantenimientoTarjeta ?? "N/A" }}
              </UBadge>
            </div>
            <div class="flex items-center rounded-lg bg-elevated px-2.5 py-1.5">
              <span class="text-muted">Uso tarjeta</span>
              <span class="ml-auto" />
              <UBadge color="neutral" variant="soft" size="sm">
                {{ row.costoTarjeta ?? "N/A" }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="sortedFilteredRows.length === 0"
        class="py-10 text-center text-sm text-muted"
      >
        No hay plataformas que coincidan con los filtros actuales.
      </div>
    </div>
  </UCard>
</template>
