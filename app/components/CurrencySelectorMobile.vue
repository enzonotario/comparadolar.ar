<script setup lang="ts">
import type { CurrencyType } from "@/lib/types";
import { currencies } from "@/lib/currencies-config";

const { getCurrentCurrency, getFullRoute, getCurrentSection } = useNavigation();

const isActive = (currency: CurrencyType) => {
  return getCurrentCurrency() === currency;
};

const getCurrencyRoute = (currency: CurrencyType) => {
  const currentSection = getCurrentSection();
  return getFullRoute(currentSection, currency);
};
</script>

<template>
  <div class="flex flex-col space-y-2">
    <NuxtLink
      v-for="currency in currencies"
      :key="currency.value"
      :to="getCurrencyRoute(currency.value)"
      class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-3 rounded-md"
      :class="{
        'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/20':
          isActive(currency.value),
      }"
    >
      <UIcon :name="currency.icon" class="w-5 h-5" />
      <span class="text-base">{{ currency.label }}</span>
    </NuxtLink>
  </div>
</template>
