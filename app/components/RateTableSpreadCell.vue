<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";

interface Props {
  rate: ExchangeRate;
  currency: string;
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
</script>

<template>
  <NuxtLink :to="`/${currency}/${rate.slug}`" class="hover:underline">
    <div class="flex items-center justify-center gap-2">
      <span
        v-if="hasValidSpread"
        class="text-sm font-mono text-gray-600 dark:text-gray-400"
      >
        ${{
          getSpread.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
      </span>
      <span v-else class="text-sm text-gray-400 dark:text-gray-500"> N/A </span>
      <UIcon
        name="i-heroicons-chevron-right-solid"
        class="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
      />
    </div>
  </NuxtLink>
</template>
