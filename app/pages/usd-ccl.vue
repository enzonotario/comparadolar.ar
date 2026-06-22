<script setup lang="ts">
import { API_BASE_URL, type ExchangeRate } from "~/lib/types";
import { toApiCurrency } from "~/lib/market-constants";
import {
  useComparePageSeo,
  buildCompareOgImage,
} from "~/composables/useComparePageSeo";

const currency = "usd-ccl";

useComparePageSeo({
  currency,
  structuredDataType: "WebPage",
});

const { data: ogData } = await useAsyncData("og-usd-ccl", () =>
  $fetch<ExchangeRate[]>(`${API_BASE_URL}/${toApiCurrency(currency)}`),
);

defineOgImage("ComparaDolar", buildCompareOgImage(currency, ogData.value ?? []));
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <CrossSellRemesas />

    <LazyLegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
