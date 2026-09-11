<script setup lang="ts">
import { getFaviconUrl } from "@/lib/favicon-config";

const route = useRoute();
const isSumarsePage = computed(() => route.path === "/sumarse");
const { navigationItems } = useNavigationItems();

const nuxtApp = useNuxtApp();
const appConfig = useAppConfig();

/** Mismo hook que `UDashboardSearch` / `provideDashboardContext` — el header no recibe `inject` del dashboard. */
function toggleProviderSearch() {
  nuxtApp.hooks.callHook("dashboard:search:toggle");
}
</script>

<template>
  <div class="shrink-0">
    <UHeader
      title="ComparaDolar.ar"
      to="/"
      :ui="{
        container: 'max-w-7xl mx-auto',
        center: 'hidden md:flex h-full min-w-0 max-w-full justify-center',
        right: 'flex h-full shrink-0 items-center justify-end gap-1.5 lg:flex-1',
        left: 'flex h-full shrink-0 items-center gap-1.5 lg:flex-1',
        root: 'fixed inset-x-0 top-0 z-50 h-(--ui-header-height) border-b border-default bg-default/75 backdrop-blur',
        // Menú modal (portal): sin z-index, sticky/overlays de página (p.ej. z-20) quedan encima.
        overlay: 'z-50',
        content: 'z-50',
      }"
    >
      <template #left>
        <div class="flex flex-row items-center gap-1">
          <NuxtLink
            to="/"
            class="flex flex-row items-center gap-1 focus-visible:outline-primary"
            aria-label="ComparaDolar.ar"
          >
            <img
              :src="getFaviconUrl()"
              alt=""
              width="28"
              height="28"
              class="w-7 h-7 rounded-full"
              loading="eager"
              fetchpriority="high"
            />
            <span
              class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white block md:hidden lg:block"
            >
              ComparaDolar.ar
            </span>
          </NuxtLink>

          <ClientOnly>
            <div v-if="!isSumarsePage" class="hidden md:block">
              <AutoRefreshIndicator />
            </div>
          </ClientOnly>
        </div>
      </template>

      <template #default>
        <SectionSelector v-if="!isSumarsePage" />
      </template>

      <template #right>
        <div class="flex shrink-0 items-center gap-1.5">
          <ClientOnly>
            <PwaNotificationsMenu v-if="!isSumarsePage" />
          </ClientOnly>

          <template v-if="!isSumarsePage">
            <UTooltip text="Buscar proveedor" :content="{ side: 'bottom' }">
              <UButton
                class="inline-flex h-7 md:hidden"
                color="neutral"
                variant="ghost"
                square
                :icon="appConfig.ui.icons.search"
                aria-label="Buscar proveedor"
                @click="toggleProviderSearch"
              />
            </UTooltip>
            <UButton
              class="hidden h-7 md:inline-flex"
              color="neutral"
              variant="outline"
              :icon="appConfig.ui.icons.search"
              label="Buscar proveedor"
              @click="toggleProviderSearch"
            >
              <template #trailing>
                <UKbd value="meta" variant="subtle" />
                <UKbd value="k" variant="subtle" />
              </template>
            </UButton>
          </template>
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <div v-if="!isSumarsePage" class="flex flex-col gap-4">
          <CurrencySelector :show-usd-type-filters="false" />

          <UNavigationMenu
            :items="navigationItems"
            orientation="vertical"
            class="-mx-2.5"
          />
        </div>
      </template>
    </UHeader>
    <!-- Reserva altura: el header es `fixed` y no ocupa flujo -->
    <div class="h-(--ui-header-height) shrink-0" aria-hidden="true" />
  </div>
</template>
