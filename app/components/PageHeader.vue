<script setup lang="ts">
import type { CurrencyType } from "~/lib/types";
import {
  getCurrencyConfig,
  getCurrencyGradient,
} from "~/lib/currencies-config";

interface Props {
  currency?: CurrencyType | string;
  title?: string;
  subtitle?: string;
  prefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "usd",
  title: undefined,
  subtitle: undefined,
  prefix: "Compará",
});

const currencyConfig = computed(() => {
  return getCurrencyConfig(props.currency as CurrencyType);
});

const displayName = computed(() => {
  return currencyConfig.value?.fullName || props.currency?.toUpperCase();
});

const subtitleText = computed(() => {
  if (props.subtitle) return props.subtitle;
  const name = displayName.value;
  return `Encontrá el mejor precio para operar ${name} en Argentina`;
});

const gradientStyle = computed(() => {
  const gradient = getCurrencyGradient(props.currency as CurrencyType);
  return {
    background: gradient,
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "background-clip": "text",
  };
});
</script>

<template>
  <header class="text-center space-y-6">
    <h1 class="text-5xl md:text-7xl font-bold">
      {{ prefix }}
      <span class="gradient-text" :style="gradientStyle">{{
        displayName
      }}</span>
    </h1>
    <p
      class="text-lg md:text-xl text-zinc-600 dark:text-white/60 max-w-2xl mx-auto"
    >
      {{ subtitleText }}
    </p>
  </header>
</template>

<style scoped>
.gradient-text {
  /* El gradiente se inyecta por estilo inline dinámico */
}
</style>
