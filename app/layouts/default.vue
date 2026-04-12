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
      <noscript>
        <div
          class="max-w-7xl mx-auto px-4 py-4 border-b border-zinc-200 dark:border-zinc-700"
        >
          <p
            class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Navegación:
          </p>
          <nav class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href="/">Inicio</a>
            <a href="/graficos">Gráficos</a>
            <a href="/terminal">Terminal</a>
            <a href="/sumarse">Sumarse</a>
          </nav>
        </div>
      </noscript>
      <div class="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        <slot />
      </div>

      <TheFooter />
    </UMain>
  </UApp>
</template>
