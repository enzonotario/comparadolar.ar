<script setup lang="ts">
import type { ExchangeRate, CurrencyType } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/types";

interface Props {
  currency: CurrencyType | string;
  /** Mockup: inyecta Banco Voii como mejor cotización + banner sponsored */
  injectVoiiMock?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  injectVoiiMock: false,
});

const {
  data: rawData,
  error,
  isLoading,
  lastUpdate,
  refresh,
} = useDataFetching<ExchangeRate[]>(API_ENDPOINTS.usd);

const buildVoiiMockRate = (rates: ExchangeRate[]): ExchangeRate => {
  const validAsk = rates
    .filter((r) => !r.slowChange && r.ask != null && r.ask > 0)
    .map((r) => r.ask as number);
  const validBid = rates
    .filter((r) => !r.slowChange && r.bid != null && r.bid > 0)
    .map((r) => r.bid as number);

  const bestAsk = validAsk.length ? Math.min(...validAsk) : 1500;
  const bestBid = validBid.length ? Math.max(...validBid) : 1480;

  return {
    slug: "banco-voii",
    name: "Banco Voii",
    prettyName: "Banco Voii",
    ask: Number((bestAsk - 0.5).toFixed(2)),
    bid: Number((bestBid + 0.5).toFixed(2)),
    logoUrl: "https://api.argentinadatos.com/static/logos/banco-voii.jpg",
    logo: "https://api.argentinadatos.com/static/logos/banco-voii.jpg",
    is24x7: true,
    isBank: true,
    usdType: "Oficial",
    url: "https://voii.com.ar/",
    sponsoredBanner: true,
  };
};

const data = computed(() => {
  if (!rawData.value || !Array.isArray(rawData.value)) return null;
  if (!props.injectVoiiMock) return rawData.value;
  return [buildVoiiMockRate(rawData.value), ...rawData.value];
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
