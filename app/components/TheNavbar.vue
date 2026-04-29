<script setup lang="ts">
import { getFaviconUrl } from "@/lib/favicon-config";

const route = useRoute();
const isSumarsePage = computed(() => route.path === "/sumarse");
const { navigationItems } = useNavigationItems();
</script>

<template>
  <div class="shrink-0">
    <UHeader
      to="/"
      :ui="{
        container: 'max-w-7xl mx-auto',
        center: 'hidden md:flex',
        root: 'fixed inset-x-0 top-0 z-50 h-(--ui-header-height) border-b border-default bg-default/75 backdrop-blur',
      }"
    >
      <template #title>
        <img
          :src="getFaviconUrl()"
          alt="ComparaDólar"
          class="w-7 h-7 rounded-full"
          loading="eager"
          fetchpriority="high"
        />
        <span
          class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white block md:hidden lg:block"
        >
          ComparaDolar.ar
        </span>
      </template>

      <template #default>
        <SectionSelector v-if="!isSumarsePage" />
      </template>

      <template #right>
        <UDashboardSearchButton
          v-if="!isSumarsePage"
          class="hidden sm:inline-flex h-7"
          label="Buscar proveedor"
        />
        <UColorModeButton />
      </template>

      <template #body>
        <div v-if="!isSumarsePage" class="flex flex-col gap-6">
          <UNavigationMenu
            :items="navigationItems"
            orientation="vertical"
            class="-mx-2.5"
          />

          <div class="px-2">
            <p
              class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider"
            >
              Cambiar Moneda
            </p>
            <CurrencySelector />
          </div>
        </div>
      </template>
    </UHeader>
    <!-- Reserva altura: el header es `fixed` y no ocupa flujo -->
    <div class="h-(--ui-header-height) shrink-0" aria-hidden="true" />
  </div>
</template>
