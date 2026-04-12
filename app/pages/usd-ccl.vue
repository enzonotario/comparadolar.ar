<script setup lang="ts">
import type { ExchangeRate } from "~/lib/types";
import {
  top3BuyUsdCcl,
  top3SellUsdCcl,
  ogUpdatedAtDate,
} from "~/utils/og-data";

const currency = "usd-ccl";

useSeo({
  currency,
});

useStructuredData({
  currency,
  type: "WebPage",
});

const { data: ogData } = await useAsyncData("og-usd-ccl", () =>
  $fetch<ExchangeRate[]>("https://api.comparadolar.ar/usd"),
);

defineOgImage("ComparaDolar", {
  title: "Compará Dólar CCL",
  buy: top3BuyUsdCcl(ogData.value ?? []),
  sell: top3SellUsdCcl(ogData.value ?? []),
  updatedAt: ogUpdatedAtDate(),
  accentColor: "#3b82f6",
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <LazyLegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
