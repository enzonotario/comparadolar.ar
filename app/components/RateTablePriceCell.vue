<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";

interface Props {
  rate: ExchangeRate;
  currency: string;
  activeTab: "buy" | "sell";
}

const props = defineProps<Props>();

const getPrice = computed(() => {
  return props.activeTab === "buy" ? props.rate.ask : props.rate.bid;
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
