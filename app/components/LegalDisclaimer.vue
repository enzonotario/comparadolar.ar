<script setup lang="ts">
interface Props {
  currency?: string;
  providerName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: undefined,
  providerName: undefined,
});

const disclaimerText = computed(() => {
  if (props.providerName && props.currency) {
    return `La información proporcionada sobre la cotización del ${props.currency.toUpperCase()} en ${props.providerName} tiene carácter meramente informativo. Las cotizaciones mostradas son referenciales y pueden variar respecto a los precios finales de transacción debido a comisiones, spread, tasas o cargos adicionales aplicados por ${props.providerName}. Te recomendamos verificar las condiciones actualizadas directamente en la plataforma de ${props.providerName} antes de realizar cualquier operación.`;
  }

  return `La información proporcionada en este sitio tiene carácter meramente informativo. Recopilamos y publicamos cotizaciones de diversas plataformas con la mayor actualización posible, sin embargo, no garantizamos la exactitud, integridad o vigencia de los datos mostrados. Los precios finales de transacción pueden variar respecto a las cotizaciones exhibidas debido a comisiones, spread, tasas o cargos adicionales aplicados por cada plataforma. El usuario acepta que este sitio y sus administradores no serán responsables por decisiones financieras tomadas en base a esta información, ni por discrepancias entre las cotizaciones mostradas y los precios de ejecución final. Se recomienda verificar las condiciones actualizadas directamente en cada plataforma antes de realizar cualquier operación.`;
});
</script>

<template>
  <UCard class="p-6">
    <p class="leading-relaxed text-sm text-zinc-600 dark:text-white/60">
      <template v-if="providerName && currency">
        <strong>Aviso importante:</strong>
        {{ disclaimerText }}
      </template>
      <template v-else>
        {{ disclaimerText }}
      </template>
    </p>
  </UCard>
</template>
