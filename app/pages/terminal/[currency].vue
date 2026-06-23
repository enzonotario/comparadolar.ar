<script setup lang="ts">
const {
  currency,
  terminalColors,
  terminalTableRef,
  providerCount,
  isLoading,
} = useTerminalPage();
</script>

<template>
  <div class="font-mono space-y-4 flex flex-col items-center md:items-start">
    <TerminalPageHeader
      :currency="currency"
      :terminal-colors="terminalColors"
      :provider-count="providerCount"
      :is-loading="isLoading"
    />

    <CurrencySelector />

    <TerminalTable ref="terminalTableRef" :currency="currency" />

    <PageFooter>
      <template #before-nav>
        <SponsorBanner />
      </template>
      <CrossSellRemesas />
    </PageFooter>
  </div>
</template>
