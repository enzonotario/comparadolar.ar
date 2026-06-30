<script setup lang="ts">
import { getUsdTypeBadgeColor } from "~/lib/market-constants";
import type { UsdFilterCategory } from "~/lib/types";

interface Props {
  variant?: "default" | "bar";
}

withDefaults(defineProps<Props>(), {
  variant: "default",
});

const { enabledTypes, categories, setTypeEnabled } = useUsdTypeFilter();

const checkboxColor = (category: UsdFilterCategory) => {
  if (category === "CCL") return "info";
  return getUsdTypeBadgeColor(category);
};
</script>

<template>
  <div
    :class="[
      'flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4',
      variant === 'bar'
        ? 'py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
        : 'py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50',
    ]"
  >
    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
      Tipos de dólar
    </span>
    <UCheckbox
      v-for="category in categories"
      :key="category"
      :model-value="enabledTypes[category]"
      :label="category"
      :color="checkboxColor(category)"
      @update:model-value="setTypeEnabled(category, $event === true)"
    />
  </div>
</template>
