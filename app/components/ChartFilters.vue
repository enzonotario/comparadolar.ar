<script setup lang="ts">
import type { ValueType } from "~/composables/useProviderHistory";
import { timeRanges, valueTypes } from "~/composables/useChartData";

interface Props {
  selectedRange: string;
  selectedValueType: ValueType;
  modelValue?: {
    range: string;
    valueType: ValueType;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:selectedRange": [value: string];
  "update:selectedValueType": [value: ValueType];
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Período:
      </span>
      <UButton
        v-for="range in timeRanges"
        :key="range.value"
        :variant="props.selectedRange === range.value ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        @click="emit('update:selectedRange', range.value)"
      >
        {{ range.label }}
      </UButton>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Mostrar:
      </span>
      <UButton
        v-for="valueType in valueTypes"
        :key="valueType.value"
        :variant="
          props.selectedValueType === valueType.value ? 'solid' : 'outline'
        "
        color="neutral"
        size="sm"
        @click="emit('update:selectedValueType', valueType.value)"
      >
        {{ valueType.label }}
      </UButton>
    </div>
  </div>
</template>
