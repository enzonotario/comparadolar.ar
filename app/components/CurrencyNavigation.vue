<script setup lang="ts">
import type { CurrencyType } from "@/lib/types";
import { validCurrencies, getCurrencyConfig } from "@/lib/currencies-config";
import { useNavigation } from "@/composables/useNavigation";
import { useTerminalState } from "@/composables/useTerminalState";

interface Props {
  currency?: CurrencyType;
}

const props = defineProps<Props>();

const { getCurrentCurrency, getCurrentSection, getFullRoute } = useNavigation();
const { buildRouteWithState } = useTerminalState();

const currentCurrency = computed(() => props.currency || getCurrentCurrency());
const currentSection = computed(() => getCurrentSection());

const currencyIndex = computed(() => {
  return validCurrencies.indexOf(currentCurrency.value);
});

const previousCurrency = computed<CurrencyType | null>(() => {
  if (currencyIndex.value <= 0) return null;
  return validCurrencies[currencyIndex.value - 1];
});

const nextCurrency = computed<CurrencyType | null>(() => {
  if (currencyIndex.value >= validCurrencies.length - 1) return null;
  return validCurrencies[currencyIndex.value + 1];
});

const getCurrencyRoute = (currency: CurrencyType) => {
  const basePath = getFullRoute(currentSection.value, currency);

  if (currentSection.value === "terminal") {
    return buildRouteWithState(basePath, currency);
  }

  return basePath;
};

const previousConfig = computed(() => {
  if (!previousCurrency.value) return null;
  return getCurrencyConfig(previousCurrency.value);
});

const nextConfig = computed(() => {
  if (!nextCurrency.value) return null;
  return getCurrencyConfig(nextCurrency.value);
});
</script>

<template>
  <div
    v-if="previousCurrency || nextCurrency"
    class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800"
  >
    <NuxtLink
      v-if="previousCurrency && previousConfig"
      :to="getCurrencyRoute(previousCurrency)"
      class="group flex items-center gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
    >
      <div class="shrink-0">
        <UIcon
          name="i-heroicons-arrow-left"
          class="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Anterior
        </div>
        <div
          class="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors"
        >
          {{ previousConfig.fullName }}
        </div>
      </div>
    </NuxtLink>

    <div v-else class="hidden md:block"></div>

    <NuxtLink
      v-if="nextCurrency && nextConfig"
      :to="getCurrencyRoute(nextCurrency)"
      class="group flex items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
    >
      <div class="flex-1 min-w-0 md:text-right">
        <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Siguiente
        </div>
        <div
          class="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors"
        >
          {{ nextConfig.fullName }}
        </div>
      </div>
      <div class="shrink-0">
        <UIcon
          name="i-heroicons-arrow-right"
          class="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"
        />
      </div>
    </NuxtLink>
  </div>
</template>
