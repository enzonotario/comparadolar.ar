<script setup lang="ts">
import {
  getCurrencyColorScheme,
  validCurrencies,
} from "@/lib/currencies-config";

const route = useRoute();

const colorScheme = computed(() => {
  const path = route.path;

  const currency = validCurrencies.find((c) => {
    if (c === "usd") return path === "/";
    return path.includes(`/${c}`);
  });

  return getCurrencyColorScheme(currency || "usd");
});

const isSumarsePage = computed(() => route.path === "/sumarse");
</script>

<template>
  <UApp>
    <LayoutBackground :color-scheme="colorScheme" />
    <TheNavbar />
    <LazyDolarMarquee v-if="!isSumarsePage" />
    <NuxtRouteAnnouncer />

    <UMain role="main">
      <div class="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        <slot />
      </div>

      <TheFooter />
    </UMain>
  </UApp>
</template>
