<script setup lang="ts">
const { currency } = await useCompareFiatPage({
  currency: "usd",
  title: getCompareHomeTitle(),
  show24x7Filter: true,
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <CrossSellRemesas />

    <Only24x7Switch />

    <PageFooter legal-disclaimer="lazy" />
  </div>
</template>
