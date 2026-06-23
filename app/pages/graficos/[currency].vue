<script setup lang="ts">
const {
  currency,
  showExchangeBands,
  selectedRange,
  selectedValueType,
  selectedProviders,
  filteredHistories,
  providerNames,
  providerOptions,
  isLoading,
  error,
  resetState,
} = useGraficosPage();
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :currency="currency"
      prefix="Gráficos de"
      subtitle="Análisis visual comparativo de las cotizaciones en tiempo real"
    />

    <CurrencySelector />

    <SponsorBanner />

    <GraficosChartPanel
      :currency="currency"
      :selected-range="selectedRange"
      :selected-value-type="selectedValueType"
      :selected-providers="selectedProviders"
      :filtered-histories="filteredHistories"
      :provider-names="providerNames"
      :provider-options="providerOptions"
      :is-loading="isLoading"
      :error="error"
      :reset-state="resetState"
      @update:selected-range="selectedRange = $event"
      @update:selected-value-type="selectedValueType = $event"
      @update:selected-providers="selectedProviders = $event"
    />

    <ExchangeBandsChart v-if="showExchangeBands" :currency="currency" />

    <PageFooter />
  </div>
</template>
