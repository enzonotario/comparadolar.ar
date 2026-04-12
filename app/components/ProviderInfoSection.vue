<script setup lang="ts">
import type { ExchangeRate, ProviderInfo } from "@/lib/types";
import { useAnalytics } from "@/composables/useAnalytics";

const { trackProviderClick } = useAnalytics();

interface Props {
  entity: string;
  currency: string;
  provider: ProviderInfo;
  rateData?: ExchangeRate;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const displayName = computed(
  () => props.provider.prettyName || props.rateData?.prettyName || props.entity,
);
const providerUrl = computed(() => props.provider.url || "#");
const currencySymbol = computed(() => props.currency.toUpperCase());
const isBank = computed(() => props.provider.isBank ?? false);

const handleProviderClick = () => {
  trackProviderClick({
    providerName: displayName.value,
    providerUrl: providerUrl.value,
    section: "provider-info",
    contentType: "button",
  });
};

const features = computed(() => [
  {
    icon: props.provider?.is24x7
      ? "i-heroicons-clock"
      : "i-heroicons-shield-check",
    title: props.provider?.is24x7 ? "Disponibilidad 24/7" : "Horario Comercial",
    description: props.provider?.is24x7
      ? `Opera todos los días del año, las 24 horas. Perfecta para operar ${currencySymbol.value} cuando otros están cerrados.`
      : `Opera en horario comercial bancario. Ideal para operaciones planificadas de ${currencySymbol.value}.`,
    badge: props.provider?.is24x7 ? "24/7" : "Horario comercial",
    badgeColor: props.provider?.is24x7 ? "success" : "warning",
  },
  {
    icon: isBank.value ? "i-heroicons-shield-check" : "i-heroicons-chart-bar",
    title: isBank.value ? "Entidad Bancaria" : "Plataforma Fintech",
    description: isBank.value
      ? `${displayName.value} es una entidad bancaria regulada con respaldo institucional para tus operaciones de ${currencySymbol.value}.`
      : `${displayName.value} es una plataforma fintech moderna especializada en operaciones digitales de ${currencySymbol.value}.`,
    badge: isBank.value ? "Banco" : "Fintech",
    badgeColor: isBank.value ? "secondary" : "info",
  },
  {
    icon: "i-heroicons-trophy",
    title: "Cotización Competitiva",
    description: `${displayName.value} ofrece precios competitivos para ${currencySymbol.value} con spread transparente y sin comisiones ocultas.`,
    badge: "Competitivo",
    badgeColor: "info",
  },
]);
</script>

<template>
  <div class="space-y-12">
    <div class="space-y-4">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Por qué elegir {{ displayName }}?
        </h2>
        <p class="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
          Conocé las características principales de {{ displayName }} para
          operar
          {{ currencySymbol }}
          y descubrí por qué miles de usuarios confían en esta plataforma.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="(feature, index) in features" :key="index">
          <template #header>
            <div class="flex items-center justify-between mb-2">
              <UIcon
                :name="feature.icon"
                class="w-6 h-6 text-indigo-600 dark:text-indigo-400"
              />
              <UBadge
                :color="feature.badgeColor.split(' ')[0].replace('bg-', '')"
                variant="soft"
              >
                {{ feature.badge }}
              </UBadge>
            </div>
            <h3 class="text-xl text-gray-900 dark:text-white">
              {{ feature.title }}
            </h3>
          </template>

          <p class="text-gray-600 dark:text-white/70 leading-relaxed">
            {{ feature.description }}
          </p>
        </UCard>
      </div>
    </div>

    <UCard
      class="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/30 dark:via-gray-900/50 dark:to-emerald-950/30 border-gray-200/50 dark:border-white/10"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <div
            class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text mb-2"
          >
            {{ provider?.is24x7 ? "24/7" : "8-18h" }}
          </div>
          <div class="text-gray-600 dark:text-white/70 font-medium">
            Horario de atención
          </div>
        </div>
        <div>
          <div
            class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text mb-2"
          >
            {{ currencySymbol }}
          </div>
          <div class="text-gray-600 dark:text-white/70 font-medium">
            Moneda disponible
          </div>
        </div>
        <div>
          <div
            class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text mb-2"
          >
            {{ isBank ? "Banco" : "Fintech" }}
          </div>
          <div class="text-gray-600 dark:text-white/70 font-medium">
            Tipo de entidad
          </div>
        </div>
      </div>
    </UCard>

    <div class="text-center space-y-4">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        ¿Listo para operar {{ currencySymbol }} en {{ displayName }}?
      </h3>
      <p class="text-gray-600 dark:text-white/70 max-w-xl mx-auto">
        Visitá la plataforma oficial para obtener más información sobre
        requisitos, límites y comenzar a operar {{ currencySymbol }} hoy mismo.
      </p>
      <UButton
        :to="providerUrl"
        external
        color="neutral"
        size="lg"
        @click="handleProviderClick"
      >
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="w-5 h-5 mr-2"
        />
        Ir a {{ displayName }}
      </UButton>
    </div>
  </div>
</template>
