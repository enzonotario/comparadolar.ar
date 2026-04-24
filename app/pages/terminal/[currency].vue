<script setup lang="ts">
import type { CurrencyType } from "@/lib/types";
import { isValidCurrency, getCurrencyConfig } from "@/lib/currencies-config";
import { useTerminalColors } from "@/composables/useTerminalColors";
import {
  top5TerminalUsd,
  top5TerminalUsdCcl,
  top5TerminalCrypto,
  ogUpdatedAtDate,
} from "~/utils/og-data";

const { currency } = useCurrency();

if (!isValidCurrency(currency.value as string)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Moneda no encontrada",
  });
}

const { terminalColors } = useTerminalColors(
  computed(() => currency.value as CurrencyType),
);
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
  title: computed(
    () => `Terminal ${currency.value.toUpperCase()} - Compará Dólar`,
  ),
  description: computed(
    () =>
      `Terminal ${currency.value.toUpperCase()} en ComparaDólar: cotizaciones en vivo, tabla compacta y exportación CSV. Compará compra, venta y spread entre proveedores sin distracciones.`,
  ),
});

const currencyConfig = getCurrencyConfig(currency.value as CurrencyType);

const isCcl = currency.value === "usd-ccl";
const isFiat = currency.value === "usd" || isCcl;

const { data: ogData } = await useAsyncData(
  `og-terminal-${currency.value}`,
  () => {
    if (isFiat) {
      return $fetch<
        Array<{
          slug: string;
          prettyName?: string;
          ask: number;
          bid: number;
          name: string;
        }>
      >("https://api.comparadolar.ar/usd");
    }
    return $fetch<
      Array<{
        slug: string;
        prettyName?: string;
        totalAsk: number;
        totalBid: number;
      }>
    >(`https://api.comparadolar.ar/${currency.value}`);
  },
);

const terminalRows = computed(() => {
  if (!ogData.value) return [];
  if (isCcl) return top5TerminalUsdCcl(ogData.value as never);
  if (isFiat) return top5TerminalUsd(ogData.value as never);
  return top5TerminalCrypto(ogData.value as never);
});

defineOgImage("Terminal", {
  title: currencyConfig?.label ?? currency.value.toUpperCase(),
  rows: terminalRows.value,
  updatedAt: ogUpdatedAtDate(),
  accentColor: currencyConfig?.gradientColors.from,
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

    <CurrencyNavigation />
  </div>
</template>
