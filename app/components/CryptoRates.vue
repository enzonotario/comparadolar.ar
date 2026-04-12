<script setup lang="ts">
import type { CryptoType } from "@/lib/types";
import { isValidCurrency } from "@/lib/currencies-config";

interface Props {
  currency: string;
}

const props = defineProps<Props>();

const cryptoType = computed(() => {
  const validCryptos = ["usdc", "usdt", "btc", "eth"];
  return validCryptos.includes(props.currency) &&
    isValidCurrency(props.currency)
    ? (props.currency as CryptoType)
    : "usdc";
});

const { data, error, isLoading, lastUpdate, refresh } = useCryptoData(
  cryptoType.value,
);
</script>

<template>
  <div class="space-y-6">
    <SummaryCards
      :data="data"
      :currency="props.currency"
      :is-loading="isLoading"
    />

    <SponsorBanner />

    <RefreshControl
      :last-update="lastUpdate"
      :is-loading="isLoading"
      :on-refresh="refresh"
    />

    <RatesList
      :data="data"
      :error="error"
      :is-loading="isLoading"
      :on-retry="refresh"
      :currency="props.currency"
    />
  </div>
</template>
