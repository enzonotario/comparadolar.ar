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
  <NuxtLink :to="`/${currency}/${rate.slug}`" class="hover:underline">
    <div class="text-center">
      <span
        v-if="getPrice"
        class="text-lg font-mono font-semibold text-gray-900 dark:text-white"
      >
        ${{
          getPrice.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
      </span>
    </div>
  </NuxtLink>
</template>
