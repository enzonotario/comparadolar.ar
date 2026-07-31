<script setup lang="ts">
const { currency } = await useCompareCryptoPage();
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <CryptoRates :currency="currency" />

    <PageFooter cross-sell legal-disclaimer="eager" />
  </div>
</template>
