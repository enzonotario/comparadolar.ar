<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";
import { getProviderDisplayName } from "@/lib/provider-display";

interface Props {
  rate: ExchangeRate;
  currency: string;
  activeTab: "buy" | "sell";
}

const props = defineProps<Props>();

const getPrice = computed(() => {
  return props.activeTab === "buy" ? props.rate.ask : props.rate.bid;
});

const priceLabel = computed(() => {
  const name = getProviderDisplayName(props.rate);
  const side = props.activeTab === "buy" ? "Compras a" : "Vendes a";
  return `${side} ${name}`;
});
</script>

<template>
  <div class="text-center">
    <template v-if="getPrice">
      <span
        v-if="rate.sponsoredBanner"
        class="font-mono text-lg font-semibold text-gray-900 dark:text-white"
      >
        ${{
          getPrice.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
      </span>
      <NuxtLink
        v-else
        :to="`/${currency}/${rate.slug}`"
        :aria-label="priceLabel"
        class="font-mono text-lg font-semibold text-gray-900 hover:underline dark:text-white"
      >
        ${{
          getPrice.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
      </NuxtLink>
    </template>
  </div>
</template>
