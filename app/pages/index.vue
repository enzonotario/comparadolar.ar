<script setup lang="ts">
import { API_BASE_URL, type ExchangeRate } from "~/lib/types";
import { toApiCurrency } from "~/lib/market-constants";
import {
  useComparePageSeo,
  getCompareHomeTitle,
  buildCompareOgImage,
} from "~/composables/useComparePageSeo";

const currency = "usd";
const { showOnly24x7 } = use24x7Filter();

useComparePageSeo({
  currency,
  title: getCompareHomeTitle(),
  structuredDataType: "WebPage",
});

const { data: ogData } = await useAsyncData("og-usd", () =>
  $fetch<ExchangeRate[]>(`${API_BASE_URL}/${toApiCurrency(currency)}`),
);

defineOgImage("ComparaDolar", buildCompareOgImage(currency, ogData.value ?? []));
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <CrossSellRemesas />

    <div class="sticky bottom-4 z-10 flex justify-center pointer-events-none">
      <div>
        <USwitch
          id="only-24x7-switch"
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

    <LazyLegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
