<script setup lang="ts">
import type { ValueType } from "~/composables/useProviderHistory";
import type { ProviderHistory } from "~/composables/useChartData";

interface Props {
  currency: string;
  selectedRange: string;
  selectedValueType: ValueType;
  selectedProviders: string[];
  filteredHistories: ProviderHistory[];
  providerNames: Record<string, string>;
  providerOptions: Array<{ value: string; label: string }>;
  isLoading: boolean;
  error: Error | null;
  resetState: () => void;
}

defineProps<Props>();

defineEmits<{
  "update:selectedRange": [value: string];
  "update:selectedValueType": [value: ValueType];
  "update:selectedProviders": [value: string[]];
}>();

const colorMode = computed(() => useColorMode().value);
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-4">
        <UsdTypeFilters v-if="currency === 'usd'" />
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <ChartFilters
              :selected-range="selectedRange"
              :selected-value-type="selectedValueType"
              @update:selected-range="$emit('update:selectedRange', $event)"
              @update:selected-value-type="
                $emit('update:selectedValueType', $event)
              "
            />
          </div>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-refresh-ccw"
            @click="resetState"
          >
            Resetear estado
          </UButton>
        </div>
        <ProviderSelector
          :providers="providerOptions"
          :selected-providers="selectedProviders"
          @update:selected-providers="
            $emit('update:selectedProviders', $event)
          "
        />
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">Cargando datos históricos...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-8 h-8 text-red-500 mx-auto mb-2"
        />
        <p class="text-sm text-red-500 mb-2">
          Error al cargar los datos históricos
        </p>
      </div>
    </div>

    <div
      v-else-if="selectedProviders.length === 0"
      class="flex items-center justify-center h-64"
    >
      <div class="text-center">
        <UIcon
          name="i-lucide-users"
          class="w-8 h-8 text-gray-400 mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">
          Selecciona al menos un provider para ver el gráfico
        </p>
      </div>
    </div>

    <ComparativeChart
      v-else
      :key="colorMode"
      :currency="currency"
      :provider-histories="filteredHistories"
      :selected-range="selectedRange"
      :value-type="selectedValueType"
      :provider-names="providerNames"
    />
  </UCard>
</template>
