<script setup lang="ts">
// Invocar ambos antes de await para no perder el contexto Nuxt.
const comparePagePromise = useCompareFiatPage({
  currency: "usd",
  title: getCompareHomeTitle(),
  show24x7Filter: true,
});
const remesasPromise = useRemesasRows();

const [{ currency }, remesasState] = await Promise.all([
  comparePagePromise,
  remesasPromise,
]);

const remesasTop3 = remesasState.top3;
const remesasLoading = remesasState.loading;
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" />

    <ExchangeBandsChart :currency="currency" />

    <RemesasTop3 :rows="remesasTop3" :loading="remesasLoading" />

    <Only24x7Switch />

    <PageFooter legal-disclaimer="lazy" />
  </div>
</template>
