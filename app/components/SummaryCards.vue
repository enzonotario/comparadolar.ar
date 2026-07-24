<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";
import { RATE_DISPLAY } from "@/lib/rate-labels";
import { isRankableProvider } from "@/lib/provider-conditions";

interface Props {
  data: ExchangeRate[] | null;
  currency: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const { showOnly24x7 } = use24x7Filter();
const { matchesFilter: matchesUsdType } = useUsdTypeFilter();

const hasPrice = (value: number | null | undefined): value is number =>
  value != null && value > 0;

const filteredData = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return null;

  let data = props.data.filter(isRankableProvider);

  if (showOnly24x7.value) {
    data = data.filter((item) => item.is24x7 === true);
  }

  if (props.currency === "usd") {
    data = data.filter((item) => matchesUsdType(item));
  }

  return data;
});

const bestBuy = computed(() => {
  if (!filteredData.value) return null;

  const candidates = filteredData.value.filter((item) => hasPrice(item.ask));
  if (candidates.length === 0) return null;

  const bestAsk = Math.min(...candidates.map((item) => item.ask!));

  return candidates.filter((item) => item.ask === bestAsk);
});

const bestSell = computed(() => {
  if (!filteredData.value) return null;

  const candidates = filteredData.value.filter((item) => hasPrice(item.bid));
  if (candidates.length === 0) return null;

  const bestBid = Math.max(...candidates.map((item) => item.bid!));

  return candidates.filter((item) => item.bid === bestBid);
});

const lowestSpread = computed(() => {
  if (!filteredData.value) return null;

  const spreads = filteredData.value
    .filter((item) => hasPrice(item.ask) && hasPrice(item.bid))
    .map((item) => ({ item, spread: item.ask! - item.bid! }));

  if (spreads.length === 0) return null;

  const minSpread = Math.min(...spreads.map(({ spread }) => spread));

  return spreads
    .filter(({ spread }) => spread === minSpread)
    .map(({ item }) => item);
});

const lowestSpreadAmount = computed(() => {
  if (!lowestSpread.value || lowestSpread.value.length === 0) return 0;
  const first = lowestSpread.value[0];
  if (!first) return 0;
  return (first.ask ?? 0) - (first.bid ?? 0);
});

const buyIconClass = `w-5 h-5 ${RATE_DISPLAY.ask.textClass}`;
const sellIconClass = `w-5 h-5 ${RATE_DISPLAY.bid.textClass}`;
const spreadIconClass = `w-5 h-5 ${RATE_DISPLAY.spread.textClass}`;
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <SummaryCard
      title="Mejor para comprar"
      :icon="RATE_DISPLAY.ask.icon"
      :icon-class="buyIconClass"
      :data="isLoading ? null : bestBuy"
      :value="bestBuy?.[0]?.ask ?? 0"
      :currency="props.currency"
    />

    <SummaryCard
      title="Mejor para vender"
      :icon="RATE_DISPLAY.bid.icon"
      :icon-class="sellIconClass"
      :data="isLoading ? null : bestSell"
      :value="bestSell?.[0]?.bid ?? 0"
      :currency="props.currency"
    />

    <SummaryCard
      title="Menor Spread"
      :icon="RATE_DISPLAY.spread.icon"
      :icon-class="spreadIconClass"
      :data="isLoading ? null : lowestSpread"
      :value="lowestSpreadAmount"
      :currency="props.currency"
    />
  </div>
</template>
