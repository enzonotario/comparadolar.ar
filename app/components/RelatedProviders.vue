<script setup lang="ts">
import { formatCurrency } from "@/lib/utils";
import type { ExchangeRate } from "@/lib/types";

interface Props {
  currency: string;
  currentEntity: string;
  providers?: ExchangeRate[];
  isLoading?: boolean;
}

const props = defineProps<Props>();

const currencySymbol = computed(() => props.currency.toUpperCase());

const relatedProviders = computed(() => {
  if (!props.providers || props.providers.length === 0) {
    return [];
  }

  return props.providers
    .filter((provider) => provider.slug !== props.currentEntity)
    .map((provider) => ({
      ...provider,
      displayName: provider.prettyName || provider.name,
      logo: provider.logoUrl || provider.logo,
    }))
    .sort((a, b) => {
      // Sort by best buy rate (highest bid)
      if (a.bid && b.bid) {
        return b.bid - a.bid;
      }
      return 0;
    })
    .slice(0, 6);
});
</script>

<template>
  <div class="space-y-12">
    <div class="space-y-4">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Otras opciones para operar {{ currencySymbol }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
          Compará con otros proveedores y encontrá la mejor cotización para tus
          operaciones de {{ currencySymbol }}.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="provider in relatedProviders"
          :key="provider.name"
          :to="`/${props.currency}/${provider.slug}`"
        >
          <UCard
            class="group h-full bg-white/60 dark:bg-white/5 backdrop-blur-sm cursor-pointer hover:ring-indigo-500 dark:hover:ring-indigo-400"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="relative">
                <UAvatar
                  :src="provider.logo"
                  :alt="provider.displayName"
                  :text="provider.displayName"
                  size="2xl"
                />
              </div>
              <div class="flex flex-col gap-0.5">
                <h3
                  class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ provider.displayName }}
                </h3>
                <UBadge
                  v-if="provider?.is24x7"
                  variant="outline"
                  color="success"
                  icon="i-heroicons-clock"
                  class="text-emerald-700 dark:text-emerald-300"
                >
                  Disponible 24/7
                </UBadge>
                <UBadge
                  v-else
                  variant="outline"
                  color="warning"
                  icon="i-heroicons-clock"
                  class="flex items-center gap-1 text-amber-700 dark:text-amber-300"
                >
                  Horario comercial
                </UBadge>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-white/60"
                  >Compra</span
                >
                <span class="font-bold text-gray-900 dark:text-white">
                  {{
                    provider.bid ? formatCurrency(provider.bid) : "Sin datos"
                  }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-white/60"
                  >Venta</span
                >
                <span class="font-bold text-gray-900 dark:text-white">
                  {{
                    provider.ask ? formatCurrency(provider.ask) : "Sin datos"
                  }}
                </span>
              </div>
            </div>

            <div
              class="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-white/60">
                  Ver detalles
                </span>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200"
                />
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <UCard
      class="text-center bg-gradient-to-r from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/30 dark:via-gray-900/50 dark:to-emerald-950/30 border-gray-200/50 dark:border-white/10"
    >
      <UIcon
        name="i-heroicons-chart-bar"
        class="size-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-4"
      />
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ¿Querés ver todas las opciones?
      </h3>
      <p class="text-gray-600 dark:text-white/70 mb-6 max-w-xl mx-auto">
        Volvé a la página principal para comparar todos los proveedores
        disponibles y encontrar la mejor cotización del momento.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton
          :to="`/${props.currency}`"
          color="neutral"
          class="flex items-center justify-center"
        >
          <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 mr-2" />
          Ver comparación completa
        </UButton>
      </div>
    </UCard>
  </div>
</template>
