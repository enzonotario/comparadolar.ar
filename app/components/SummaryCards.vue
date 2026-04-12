<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";

interface Props {
  data: ExchangeRate[] | null;
  currency: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const { showOnly24x7 } = use24x7Filter();

const filteredData = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return null;

  let data = props.data;

  if (showOnly24x7.value) {
    data = data.filter((item) => item.is24x7 === true);
  }

  if (props.currency !== "usd-ccl") {
    data = data.filter((item) => !item.isUsdCcl);
  }

  return data;
});

const bestBuy = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) return null;

  const bestAsk = filteredData.value.reduce(
    (min, current) => (current.ask < min ? current.ask : min),
    Infinity,
  );

  return filteredData.value.filter((item) => item.ask === bestAsk);
});

const bestSell = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) return null;

  const bestBid = filteredData.value.reduce(
    (max, current) => (current.bid > max ? current.bid : max),
    -Infinity,
  );

  return filteredData.value.filter((item) => item.bid === bestBid);
});

const lowestSpread = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) return null;

  const spreads = filteredData.value.map((item) => ({
    item,
    spread: item.ask - item.bid,
  }));

  const minSpread = spreads.reduce(
    (min, current) => (current.spread < min ? current.spread : min),
    Infinity,
  );

  return spreads
    .filter(({ spread }) => spread === minSpread)
    .map(({ item }) => item);
});

const lowestSpreadAmount = computed(() => {
  if (!lowestSpread.value || lowestSpread.value.length === 0) return 0;
  const first = lowestSpread.value[0];
  if (!first) return 0;
  return first.ask - first.bid;
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <SummaryCard
      title="Mejor para comprar"
      icon="i-heroicons-arrow-down"
      icon-class="w-5 h-5 text-green-600"
      :data="isLoading ? null : bestBuy"
      :value="bestBuy?.[0]?.ask ?? 0"
      :currency="props.currency"
    />

    <SummaryCard
      title="Mejor para vender"
      icon="i-heroicons-arrow-up"
      icon-class="w-5 h-5 text-red-600"
      :data="isLoading ? null : bestSell"
      :value="bestSell?.[0]?.bid ?? 0"
      :currency="props.currency"
    />

    <SummaryCard
      title="Menor Spread"
      icon="i-heroicons-arrows-pointing-out"
      icon-class="w-5 h-5 text-blue-600"
      :data="isLoading ? null : lowestSpread"
      :value="lowestSpreadAmount"
      :currency="props.currency"
    />
  </div>
</template>
