<script setup lang="ts">
const { currency } = useCompareFiatPage({ currency: "usd-ccl" });
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <PageFooter cross-sell legal-disclaimer="lazy" />
  </div>
</template>
