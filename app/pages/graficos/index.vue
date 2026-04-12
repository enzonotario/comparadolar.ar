<script setup lang="ts">
import type { CurrencyType, ExchangeRate } from "~/lib/types";
import ComparativeChart from "~/components/ComparativeChart.vue";
import ProviderSelector from "~/components/ProviderSelector.vue";
import {
  top3SlugsForBuyUsd,
  buildOgChartLines,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

const currency = ref<CurrencyType>("usd");

definePageMeta({
  layout: "minimal",
});

useSeo({
  title: `Gráficos ${currency.value.toUpperCase()} - Compará Dólar`,
  description: `Gráficos y análisis de tasas de cambio ${currency.value.toUpperCase()} en tiempo real`,
});

const { data: ogRates } = await useAsyncData("og-graficos-usd-rates", () =>
  $fetch<ExchangeRate[]>("https://api.comparadolar.ar/usd"),
);

const only24x7 = shouldOgShowOnly24x7();
const top3 = top3SlugsForBuyUsd(ogRates.value ?? [], only24x7);

const since3Days = new Date();
since3Days.setDate(since3Days.getDate() - 3);

const { data: ogHistories } = await useAsyncData(
  "og-graficos-usd-history",
  async () => {
    return Promise.all(
      top3.map(async ({ slug, name }) => {
        const data = await $fetch<Array<{ bid: number; ask: number; timestamp: string }>>(
          `https://api.comparadolar.ar/usd/providers/${slug}/history`,
        );
        return { name, data };
      }),
    );
  },
);

const { lines, yTicks } = buildOgChartLines(ogHistories.value ?? [], since3Days, 960, 200);

defineOgImage("Graficos", {
  title: "Dólar",
  lines,
  yTicks,
  accentColor: "#10b981",
  updatedAt: ogUpdatedAtDate(),
  priceLabel: "Comprás a",
});

const colorMode = computed(() => useColorMode().value);

const {
  selectedRange,
  selectedValueType,
  selectedProviders,
  filteredHistories,
  providerNames,
  providerOptions,
  isLoading,
  error,
  resetState,
} = useChartData(computed(() => currency.value));
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :currency="currency"
      prefix="Gráficos de"
      subtitle="Análisis visual comparativo de las cotizaciones en tiempo real"
    />

    <CurrencySelector />

    <SponsorBanner />

    <UCard>
      <template #header>
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <ChartFilters
                :selected-range="selectedRange"
                :selected-value-type="selectedValueType"
                @update:selected-range="selectedRange = $event"
                @update:selected-value-type="selectedValueType = $event"
              />
            </div>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-refresh-ccw"
              @click="resetState"
            >
              Resetear estado
            </UButton>
          </div>
          <ProviderSelector
            :providers="providerOptions"
            :selected-providers="selectedProviders"
            @update:selected-providers="selectedProviders = $event"
          />
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
        </div>
      </div>

      <div
        v-else-if="selectedProviders.length === 0"
        class="flex items-center justify-center h-64"
      >
        <div class="text-center">
          <UIcon
            name="i-lucide-users"
            class="w-8 h-8 text-gray-400 mx-auto mb-2"
          />
          <p class="text-sm text-gray-500">
            Selecciona al menos un provider para ver el gráfico
          </p>
        </div>
      </div>

      <ComparativeChart
        v-else
        :key="colorMode"
        :currency="currency"
        :provider-histories="filteredHistories"
        :selected-range="selectedRange"
        :value-type="selectedValueType"
        :provider-names="providerNames"
      />
    </UCard>

    <ExchangeBandsChart :currency="currency" />

    <CurrencyNavigation :currency="currency" />
  </div>
</template>
