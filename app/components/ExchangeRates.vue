<script setup lang="ts">
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/types";

interface Props {
  currency: CurrencyType | string;
}

const props = defineProps<Props>();

const {
  data: rawData,
  error,
  isLoading,
  lastUpdate,
  refresh,
} = useDataFetching<ExchangeRate[]>(API_ENDPOINTS.usd);

const data = computed(() => {
  if (!rawData.value || !Array.isArray(rawData.value)) return null;

  if (props.currency === "usd-ccl") {
    return rawData.value.filter((item) => item.isUsdCcl === true);
  }

  return rawData.value;
});

const noSlowChangeData = computed(() => {
  if (!data.value || !Array.isArray(data.value)) return null;

  return data.value.filter((item) => !item.slowChange);
});
</script>

<template>
  <div class="space-y-6">
    <SummaryCards
      :data="noSlowChangeData"
      :currency="currency"
      :is-loading="isLoading"
    />

    <LazySponsorBanner />

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
      :currency="currency"
    />
  </div>
</template>
