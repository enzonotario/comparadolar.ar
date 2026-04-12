<script setup lang="ts">
import type { ExchangeRate } from "~/lib/types";
import {
  top3BuyUsd,
  top3SellUsd,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

const { showOnly24x7 } = use24x7Filter();
const currency = "usd";

useSeo({
  currency,
});

useStructuredData({
  currency,
  type: "WebPage",
});

const { data: ogData } = await useAsyncData("og-usd", () =>
  $fetch<ExchangeRate[]>("https://api.comparadolar.ar/usd"),
);

const only24x7 = shouldOgShowOnly24x7();

defineOgImage("ComparaDolar", {
  title: "Compará Dólar",
  buy: top3BuyUsd(ogData.value ?? [], only24x7),
  sell: top3SellUsd(ogData.value ?? [], only24x7),
  updatedAt: ogUpdatedAtDate(),
  accentColor: "#10b981",
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <div class="sticky bottom-4 z-10 flex justify-center pointer-events-none">
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

    <LazyLegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
