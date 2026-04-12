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
  <div class="flex flex-wrap gap-2 justify-center">
    <UButton
      v-for="currency in currencies"
      :key="currency.value"
      :variant="isActive(currency.value) ? 'solid' : 'outline'"
      color="neutral"
      size="sm"
      :to="getCurrencyRoute(currency.value)"
      class="transition-all duration-200"
    >
      <UIcon :name="currency.icon" class="mr-2" />
      {{ currency.label }}
    </UButton>
  </div>
</template>
