<script setup lang="ts">
import type { CurrencyType } from "@/lib/types";
import { currencies } from "@/lib/currencies-config";

const { getCurrentCurrency, getFullRoute, getCurrentSection } = useNavigation();
const { buildRouteWithState } = useTerminalState();

const isActive = (currency: CurrencyType) => {
  return getCurrentCurrency() === currency;
};

const getCurrencyRoute = (currency: CurrencyType) => {
  const currentSection = getCurrentSection();
  const basePath = getFullRoute(currentSection, currency);

  // Load saved state from localStorage for this currency
  if (currentSection === "terminal") {
    return buildRouteWithState(basePath, currency);
  }

  return basePath;
};
</script>

<template>
  <div
    class="relative flex flex-wrap items-center justify-center gap-2 overflow-visible"
    :class="isActive('usd') ? 'pb-9' : undefined"
  >
    <div
      v-for="currency in currencies"
      :key="currency.value"
      :class="currency.value === 'usd' ? 'relative overflow-visible' : undefined"
    >
      <UButton
        :variant="isActive(currency.value) ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        :to="getCurrencyRoute(currency.value)"
        class="transition-all duration-200"
      >
        <UIcon :name="currency.icon" class="mr-2" />
        {{ currency.label }}
      </UButton>

      <div
        v-if="currency.value === 'usd' && isActive('usd')"
        class="absolute left-0 top-full z-20 mt-1.5 md:whitespace-nowrap"
      >
        <UsdTypeFilters variant="subtabs" />
      </div>
    </div>
  </div>
</template>
