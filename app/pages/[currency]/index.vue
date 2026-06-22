<script setup lang="ts">
import { API_BASE_URL } from "~/lib/types";
import {
  useComparePageSeo,
  buildCompareOgImage,
} from "~/composables/useComparePageSeo";
import { useValidatedRouteCurrency } from "~/composables/useValidatedRouteCurrency";

const { currency, apiCurrency } = useValidatedRouteCurrency();

useComparePageSeo({
  currency: currency.value,
  structuredDataType: "FinancialProduct",
});

const { data: ogData } = await useAsyncData(
  computed(() => `og-${currency.value}`),
  () =>
    $fetch<
      Array<{
        slug: string;
        prettyName?: string;
        totalAsk: number;
        totalBid: number;
      }>
    >(`${API_BASE_URL}/${apiCurrency.value}`),
);

defineOgImage(
  "ComparaDolar",
  buildCompareOgImage(currency.value, ogData.value ?? []),
);
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <CryptoRates :currency="currency" />

    <CrossSellRemesas />

    <LegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
