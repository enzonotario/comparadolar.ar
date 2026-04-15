<script setup lang="ts">
import { getFaviconUrl } from "@/lib/favicon-config";

const route = useRoute();
const isSumarsePage = computed(() => route.path === "/sumarse");
const { navigationItems } = useNavigationItems();
</script>

<template>
  <UHeader
    to="/"
    :ui="{
      container: 'max-w-7xl mx-auto',
      center: 'hidden md:flex',
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
</template>
