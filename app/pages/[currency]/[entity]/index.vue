<script setup lang="ts">
import {
  API_BASE_URL,
  type CurrencyType,
  type ExchangeRate,
} from "~/lib/types";
import { isValidCurrency } from "~/lib/currencies-config";
import { useEntityData } from "~/composables/useEntityData";

definePageMeta({
  layout: "minimal",
});

const route = useRoute();
const currency = route.params.currency as string;
const entity = route.params.entity as string;

if (!currency || !entity) {
  throw createError({
    statusCode: 400,
    statusMessage: "Parámetros inválidos",
  });
}

if (currency && !isValidCurrency(currency)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Moneda no soportada",
  });
}

const { data, isLoading, error, refresh } = useEntityData(
  currency as CurrencyType,
  entity,
);

const apiCurrency = currency === "usd-ccl" ? "usd" : currency;

const { data: ratesData, refresh: refreshRates } = useDataFetching<
  ExchangeRate[]
>(`${API_BASE_URL}/${apiCurrency}`);

const handleRetry = () => {
  refresh();
  refreshRates();
};

const rateData = computed(() => {
  if (!ratesData.value) return null;

  return ratesData.value.find((rate) => rate.slug === entity);
});

const allProviders = computed(() => {
  if (!data.value || !ratesData.value) return [];

  return data.value.map((provider) => {
    const rateInfo = ratesData.value.find(
      (rate) => rate.slug === provider.slug,
    );
    return {
      ...provider,
      bid: rateInfo?.bid,
      ask: rateInfo?.ask,
    };
  });
});

const currentProvider = computed(() => {
  if (!data.value || !ratesData.value || !allProviders.value) return null;

  return allProviders.value.find((provider) => provider.slug === entity);
});

const seoTitle = computed(() => {
  const provider = currentProvider.value;
  if (provider) {
    return `Cotización de ${currency.toUpperCase()} en ${provider.prettyName}`;
  }
  return `Cotización de ${currency.toUpperCase()} - Compará Dólar`;
});

const seoDescription = computed(() => {
  const provider = currentProvider.value;
  if (provider) {
    return `Consulta la cotización actual e histórica de ${currency.toUpperCase()} en ${provider.prettyName}.`;
  }
  return `Consulta la cotización de ${currency.toUpperCase()}`;
});

useSeo({
  title: seoTitle,
  description: seoDescription,
  currency: currency as CurrencyType,
});
</script>

<template>
  <ProviderPageSkeleton v-if="isLoading" />

  <UAlert
    v-else-if="error"
    icon="i-heroicons-exclamation-triangle"
    color="error"
    variant="soft"
    title="Error al cargar datos"
    :description="error.message"
    class="max-w-7xl mx-auto px-4 py-12"
  >
    <template #actions>
      <UButton color="error" variant="soft" @click="handleRetry">
        Reintentar
      </UButton>
    </template>
  </UAlert>

  <div v-else-if="data">
    <div v-if="currentProvider" class="space-y-12">
      <section v-if="rateData">
        <ProviderHero
          :entity="entity"
          :currency="currency"
          :provider="currentProvider"
          :rate-data="rateData"
          :is-loading="isLoading"
        />
      </section>

      <CurrencySelector />

      <section>
        <ProviderInfoSection
          :entity="entity"
          :currency="currency"
          :provider="currentProvider"
          :rate-data="rateData"
          :is-loading="isLoading"
        />
      </section>

      <section>
        <RelatedProviders
          :currency="currency"
          :current-entity="entity"
          :providers="allProviders"
          :provider="currentProvider"
          :is-loading="isLoading"
        />
      </section>

      <section>
        <ProviderFAQ
          :entity="entity"
          :currency="currency"
          :provider="currentProvider"
          :rate-data="rateData"
          :is-loading="isLoading"
        />
      </section>

      <LegalDisclaimer
        :currency="currency"
        :provider-name="currentProvider.prettyName"
      />

      <CurrencyNavigation />
    </div>
    <UEmpty
      v-else
      title="Proveedor no encontrado"
      :description="`No se pudo encontrar información para ${entity} en ${currency.toUpperCase()}.`"
      :actions="[{ label: 'Volver al comparador', to: '/', color: 'neutral' }]"
      class="max-w-md mx-auto"
    />
  </div>
</template>
