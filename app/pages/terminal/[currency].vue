<script setup lang="ts">
const { currency, terminalColors, terminalTableRef, providerCount, isLoading } =
  await useTerminalPage();

useHead({
  link: [
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: "/fonts/ioskeley-mono/IoskeleyMono-Regular.woff2",
      crossorigin: "",
    },
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: "/fonts/ioskeley-mono/IoskeleyMono-Bold.woff2",
      crossorigin: "",
    },
  ],
});
</script>

<template>
  <TerminalShell>
    <TerminalPageHeader
      :currency="currency"
      :terminal-colors="terminalColors"
      :provider-count="providerCount"
      :is-loading="isLoading"
    />

    <CurrencySelector />

    <TerminalTable ref="terminalTableRef" :currency="currency" />
  </TerminalShell>

  <PageFooter class="mt-8">
    <template #before-nav>
      <SponsorBanner />
    </template>
    <RemesasTop3 />
  </PageFooter>
</template>
