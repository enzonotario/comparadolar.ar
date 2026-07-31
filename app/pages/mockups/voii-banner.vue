<script setup lang="ts">
const { currency } = useCompareFiatPage({
  currency: "usd",
  title: getCompareHomeTitle(),
  show24x7Filter: true,
});

useSeoMeta({
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" inject-voii-mock />

    <ExchangeBandsChart :currency="currency" />

    <CrossSellRemesas />

    <Only24x7Switch />

    <PageFooter legal-disclaimer="lazy" />
  </div>
</template>
