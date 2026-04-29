<script setup lang="ts">
import { getCurrencyColorScheme } from "@/lib/currencies-config";

const route = useRoute();

const colorScheme = computed(() => {
  const currency = route.params.currency as string;
  return getCurrencyColorScheme(currency);
});
</script>

<template>
  <UApp>
    <UDashboardGroup class="flex min-h-dvh flex-col">
      <LayoutBackground :color-scheme="colorScheme" />
      <TheNavbar />
      <NuxtRouteAnnouncer />

      <GlobalProviderSearch />

      <UMain role="main" class="flex-1">
        <noscript>
          <div class="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
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
        <UContainer class="px-4 py-8 space-y-8">
          <slot />
        </UContainer>

        <TheFooter />
      </UMain>
    </UDashboardGroup>
  </UApp>
</template>
