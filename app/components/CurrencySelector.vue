<script setup lang="ts">
import type { CurrencyType } from "@/lib/types";
import { currencies } from "@/lib/currencies-config";

const props = withDefaults(
  defineProps<{
    /** Filtros Oficial/MEP/… bajo USD. En menú móvil conviene apagarlos. */
    showUsdTypeFilters?: boolean;
  }>(),
  { showUsdTypeFilters: true },
);

const { getCurrentCurrency, getFullRoute, getCurrentSection } = useNavigation();
const { buildRouteWithState } = useTerminalState();

const isActive = (currency: CurrencyType) => {
  return getCurrentCurrency() === currency;
};

const getCurrencyRoute = (currency: CurrencyType) => {
  // Remesas no tiene rutas por moneda: el selector vuelve a Comparar.
  const currentSection =
    getCurrentSection() === "remesas" ? "compare" : getCurrentSection();
  const basePath = getFullRoute(currentSection, currency);

  // Load saved state from localStorage for this currency
  if (currentSection === "terminal") {
    return buildRouteWithState(basePath, currency);
  }

  return basePath;
};

const showUsdFilters = computed(
  () => props.showUsdTypeFilters && isActive("usd"),
);
</script>

<template>
  <div
    class="relative flex flex-wrap items-center justify-center gap-2 overflow-visible"
    :class="showUsdFilters ? 'pb-9' : undefined"
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
        v-if="currency.value === 'usd' && showUsdFilters"
        class="absolute left-0 top-full z-20 mt-1.5 md:whitespace-nowrap"
      >
        <UsdTypeFilters variant="subtabs" />
      </div>
    </div>
  </div>
</template>
