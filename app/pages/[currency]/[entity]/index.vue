<script setup lang="ts">
const {
  currency,
  entity,
  data,
  isLoading,
  error,
  handleRetry,
  rateData,
  allProviders,
  currentProvider,
  comparisonTablePath,
  categoryFullName,
} = useProviderPage();
</script>

<template>
  <div>
    <div class="mb-8 flex justify-start">
      <UButton
        :to="comparisonTablePath"
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        size="lg"
        :aria-label="`Volver a la tabla de ${categoryFullName}`"
      >
        Volver a la tabla
      </UButton>
    </div>

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
        :actions="[
          {
            label: 'Volver al comparador',
            to: comparisonTablePath,
            color: 'neutral',
          },
        ]"
        class="max-w-md mx-auto"
      />
    </div>
  </div>
</template>
