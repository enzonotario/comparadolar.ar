<script setup lang="ts">
import type { CurrencyType, ExchangeRate } from "~/lib/types";
import { useTerminalColors } from "@/composables/useTerminalColors";
import {
  top5TerminalUsd,
  ogUpdatedAtDate,
  shouldOgShowOnly24x7,
} from "~/utils/og-data";

const currency = ref<CurrencyType>("usd");
const { terminalColors } = useTerminalColors(currency);
const terminalTableRef = ref();

const providerCount = computed(() => {
  return terminalTableRef.value?.filteredRates?.length || 0;
});

const isLoading = computed(() => {
  return terminalTableRef.value?.isLoading ?? true;
});

definePageMeta({
  layout: "minimal",
});

useSeo({
  title: `Terminal ${currency.value.toUpperCase()} - Compará Dólar`,
  description: `Monitor de tasas de cambio ${currency.value.toUpperCase()} en tiempo real con interfaz de terminal`,
});

const { data: ogData } = await useAsyncData("og-terminal-usd", () =>
  $fetch<ExchangeRate[]>("https://api.comparadolar.ar/usd"),
);

defineOgImage("Terminal", {
  title: "USD",
  rows: top5TerminalUsd(ogData.value ?? [], shouldOgShowOnly24x7()),
  updatedAt: ogUpdatedAtDate(),
  accentColor: "#10b981",
});
</script>

<template>
  <div class="font-mono space-y-4 flex flex-col items-center md:items-start">
    <header class="w-full">
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-end w-full gap-2"
      >
        <div class="flex flex-col gap-2 text-center md:text-left">
          <h1 :class="['text-2xl font-bold', terminalColors.text]">
            $ RATES MONITOR
          </h1>
          <p :class="`${terminalColors.textSecondary} text-sm`">
            Tasas de cambio en tiempo real
          </p>
        </div>

        <div
          class="flex flex-row flex-wrap gap-2 justify-center md:justify-end"
        >
          <template v-if="isLoading">
            <USkeleton class="h-6 w-40" />
            <USkeleton class="h-6 w-44" />
          </template>
          <template v-else>
            <UBadge
              :class="[terminalColors.textSecondary, terminalColors.ring]"
              size="sm"
              variant="subtle"
              color="neutral"
            >
              Proveedores {{ currency.toUpperCase() }}:
              <span class="font-mono">{{ providerCount }}</span>
            </UBadge>
            <UBadge
              :class="[terminalColors.textSecondary, terminalColors.ring]"
              size="sm"
              variant="subtle"
              color="neutral"
            >
              Última actualización:
              {{
                new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              }}
            </UBadge>
          </template>
        </div>
      </div>
    </header>

    <CurrencySelector />

    <TerminalTable ref="terminalTableRef" :currency="currency" />

    <SponsorBanner />

    <CurrencyNavigation :currency="currency" />
  </div>
</template>
