<script setup lang="ts">
import { getUsdTypeBadgeColor } from "~/lib/market-constants";
import type { UsdFilterCategory } from "~/lib/types";

interface Props {
  variant?: "default" | "bar" | "subtabs";
}

withDefaults(defineProps<Props>(), {
  variant: "default",
});

const { enabledTypes, categories, setTypeEnabled } = useUsdTypeFilter();
const { includeConditions } = useIncludeConditions();
const { getCurrentSection } = useNavigation();

const showConditionsToggle = computed(() => getCurrentSection() === "compare");

const tabColor = (category: UsdFilterCategory) => {
  if (category === "CCL") return "info";
  return getUsdTypeBadgeColor(category);
};
</script>

<template>
  <div
    v-if="variant === 'subtabs'"
    class="inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900"
  >
    <UCheckbox
      v-for="category in categories"
      :key="category"
      :model-value="enabledTypes[category]"
      :label="category"
      :color="tabColor(category)"
      @update:model-value="setTypeEnabled(category, $event === true)"
    />
    <UCheckbox
      v-if="showConditionsToggle"
      v-model="includeConditions"
      label="Con condiciones"
      color="warning"
      class="md:border-l md:border-zinc-200 md:pl-3 dark:md:border-zinc-700"
    />
  </div>

  <div
    v-else
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
      :color="tabColor(category)"
      @update:model-value="setTypeEnabled(category, $event === true)"
    />
  </div>
</template>
