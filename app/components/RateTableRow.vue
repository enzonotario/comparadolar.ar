<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";

interface Props {
  rate: ExchangeRate;
  currency: string;
  activeTab: "buy" | "sell";
}

const props = defineProps<Props>();

const hasValidSpread = computed(() => {
  return (
    props.rate.ask != null &&
    props.rate.ask > 0 &&
    props.rate.bid != null &&
    props.rate.bid > 0
  );
});

const getSpread = computed(() => {
  if (!hasValidSpread.value) return 0;
  return props.rate.ask - props.rate.bid;
});

const getSpreadPercentage = computed(() => {
  if (!hasValidSpread.value) return "0.00";
  const spread = getSpread.value;
  const midPrice = (props.rate.ask + props.rate.bid) / 2;
  return ((spread / midPrice) * 100).toFixed(2);
});

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/placeholder.svg";
};
</script>

<template>
  <NuxtLink :to="`/${currency}/${rate.slug}`" class="hover:underline">
    <div class="flex items-center gap-3">
      <img
        :src="rate.logoUrl || rate.logo || '/placeholder.svg'"
        :alt="rate.prettyName || rate.name"
        class="w-8 h-8 rounded-full"
        @error="handleImageError"
      />
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ rate.prettyName || rate.name }}
          </h3>
          <UBadge v-if="rate.is24x7" color="success" size="xs"> 24/7 </UBadge>
          <UBadge
            v-if="rate.isUsdCcl && currency !== 'usd-ccl'"
            color="info"
            size="xs"
          >
            CCL
          </UBadge>
        </div>
        <p
          v-if="hasValidSpread"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          Spread: {{ getSpreadPercentage }}%
        </p>
        <p v-else class="text-xs text-gray-500 dark:text-gray-400">
          Spread: N/A
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
