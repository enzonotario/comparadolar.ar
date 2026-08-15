<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";
import type { TableColumn } from "@nuxt/ui";

interface Props {
  rates: ExchangeRate[];
  columns: TableColumn<ExchangeRate>[];
  currency: string;
  activeTab: "buy" | "sell";
  isLoading?: boolean;
  sorting?: Array<{ id: string; desc: boolean }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:sorting": [value: Array<{ id: string; desc: boolean }>];
}>();

const internalSorting = computed({
  get: () => props.sorting ?? [],
  set: (value) => emit("update:sorting", value ?? []),
});
</script>

<template>
  <div class="rate-table-wrapper">
    <UTable
      v-model:sorting="internalSorting"
      :data="rates"
      :columns="columns"
      :loading="isLoading"
      :ui="{
        root: 'table-fixed',
        separator: 'hidden',
      }"
    >
      <template #name-cell="{ row }">
        <RateTableRow
          :rate="row.original"
          :currency="currency"
          :active-tab="activeTab"
        />
      </template>

      <template #price-cell="{ row }">
        <RateTablePriceCell
          :rate="row.original"
          :currency="currency"
          :active-tab="activeTab"
        />
      </template>

      <template #spread-cell="{ row }">
        <RateTableSpreadCell :rate="row.original" :currency="currency" />
      </template>
    </UTable>
  </div>
</template>

<style scoped>
.rate-table-wrapper :deep(table) {
  table-layout: fixed;
  width: 100%;
}

/* Desktop: 3 columnas (Proveedor, Precio, Spread) */
.rate-table-wrapper :deep(thead th:first-child),
.rate-table-wrapper :deep(tbody td:first-child) {
  width: 50%;
}

.rate-table-wrapper :deep(thead th:nth-child(2)),
.rate-table-wrapper :deep(tbody td:nth-child(2)) {
  width: 25%;
}

.rate-table-wrapper :deep(thead th:nth-child(3)),
.rate-table-wrapper :deep(tbody td:nth-child(3)) {
  width: 25%;
}

/* Mobile: 2 columnas (Proveedor, Precio) */
@media (max-width: 767px) {
  .rate-table-wrapper :deep(thead th:first-child),
  .rate-table-wrapper :deep(tbody td:first-child) {
    width: 60%;
  }

  .rate-table-wrapper :deep(thead th:nth-child(2)),
  .rate-table-wrapper :deep(tbody td:nth-child(2)) {
    width: 40%;
  }
}

/* Sponsored Voii: precio alineado arriba (no centrado a la altura del banner) */
.rate-table-wrapper :deep(tbody tr:has(.voii-banner) > td) {
  vertical-align: top;
}

.rate-table-wrapper :deep(tbody tr:has(.voii-banner) > td:nth-child(2)),
.rate-table-wrapper :deep(tbody tr:has(.voii-banner) > td:nth-child(3)) {
  padding-top: 1.15rem;
}
</style>
