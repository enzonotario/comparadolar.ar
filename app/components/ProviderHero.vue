<script setup lang="ts">
import { calculateSpread, formatCurrency } from "@/lib/utils";
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
const logo = computed(
  () =>
    props.rateData?.logoUrl ||
    props.rateData?.logo ||
    props.provider.logoUrl ||
    "/placeholder.svg",
);
const currencySymbol = computed(() => props.currency.toUpperCase());

const spread = computed(() => {
  if (props.rateData?.bid && props.rateData?.ask) {
    return calculateSpread(props.rateData.ask, props.rateData.bid);
  }
  return null;
});

const colorMode = computed(() => useColorMode().value);

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
  const fallback = target.nextElementSibling as HTMLElement;
  if (fallback) {
    fallback.style.display = "flex";
  }
};

const handleProviderClick = () => {
  trackProviderClick({
    providerName: displayName.value,
    providerUrl: providerUrl.value,
    section: "provider-hero",
    contentType: "button",
  });
};
</script>

<template>
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
  >
    <div class="flex items-center gap-4 mb-6 md:mb-0">
      <div class="relative">
        <UAvatar
          :src="logo"
          :alt="displayName"
          :text="displayName"
          :ui="{
            root: 'size-16',
          }"
          @error="handleImageError"
        />
      </div>
      <div>
        <h1
          class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {{ displayName }}
        </h1>
        <div class="flex items-center flex-wrap gap-2">
          <span class="text-lg font-medium">
            Cotización {{ currencySymbol }}
          </span>
          <UBadge
            v-if="props.provider?.is24x7"
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
    </div>

    <UButton
      :to="providerUrl"
      external
      target="_blank"
      rel="noopener noreferrer"
      color="neutral"
      size="lg"
      class="flex items-center justify-center"
      @click="handleProviderClick"
    >
      <UIcon
        name="i-heroicons-arrow-top-right-on-square"
        class="w-5 h-5 mr-2"
      />
      Ir a {{ displayName }}
    </UButton>
  </div>

  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-arrow-down"
                class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  Compra
                </h3>
              </div>
            </div>
          </div>
        </template>

        <div
          class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
        >
          {{ rateData?.bid ? formatCurrency(rateData.bid) : "Sin datos" }}
        </div>
        <p
          v-if="rateData?.bid"
          class="text-sm text-gray-600 dark:text-white/60 mt-2"
        >
          Al vender {{ currencySymbol }}, recibirás este precio por unidad
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-arrow-up"
                class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  Venta
                </h3>
              </div>
            </div>
          </div>
        </template>

        <div
          class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
        >
          {{ rateData?.ask ? formatCurrency(rateData.ask) : "Sin datos" }}
        </div>
        <p
          v-if="rateData?.ask"
          class="text-sm text-gray-600 dark:text-white/60 mt-2"
        >
          Al comprar {{ currencySymbol }}, pagarás este precio por unidad
        </p>
      </UCard>
    </div>

    <UCard
      v-if="spread !== null"
      class="bg-white/40 dark:bg-white/5 backdrop-blur-sm border-gray-200/50 dark:border-white/10"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-arrows-pointing-out"
            class="w-5 h-5 text-gray-600 dark:text-white/60"
          />
          <span class="font-medium text-gray-900 dark:text-white">Spread</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-gray-900 dark:text-white">
            {{
              (spread / 100).toLocaleString("es-AR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </div>
          <div class="text-sm text-gray-600 dark:text-white/60">
            Diferencia entre compra y venta
          </div>
        </div>
      </div>
    </UCard>

    <ProviderHistoryChart
      :key="colorMode"
      :provider="entity"
      :currency="currency"
    />
  </div>
</template>
