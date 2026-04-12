<script setup lang="ts">
import { isValidCurrency, getCurrencyConfig } from "~/lib/currencies-config";
import type { CurrencyType } from "~/lib/types";
import {
  top3BuyCrypto,
  top3SellCrypto,
  ogUpdatedAtDate,
} from "~/utils/og-data";

const { currency } = useCurrency();

if (!isValidCurrency(currency.value as string)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Moneda no soportada",
  });
}

useSeo({
  currency: currency.value as CurrencyType,
});

useStructuredData({
  currency: currency.value as CurrencyType,
  type: "FinancialProduct",
});

const currencyConfig = getCurrencyConfig(currency.value as CurrencyType);

const { data: ogData } = await useAsyncData(`og-${currency.value}`, () =>
  $fetch<
    Array<{
      slug: string;
      prettyName?: string;
      totalAsk: number;
      totalBid: number;
    }>
  >(`https://api.comparadolar.ar/${currency.value}`),
);

defineOgImage("ComparaDolar", {
  title: `Compará ${currencyConfig?.fullName ?? currency.value.toUpperCase()}`,
  buy: top3BuyCrypto(ogData.value ?? []),
  sell: top3SellCrypto(ogData.value ?? []),
  updatedAt: ogUpdatedAtDate(),
  accentColor: currencyConfig?.gradientColors.from,
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <CryptoRates :currency="currency" />

    <LegalDisclaimer />

    <CurrencyNavigation />
  </div>
</template>
