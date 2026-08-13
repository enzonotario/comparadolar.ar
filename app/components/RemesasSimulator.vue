<script setup lang="ts">
const PRESETS = [
  { value: 100, label: "US$ 100" },
  { value: 500, label: "US$ 500" },
  { value: 1000, label: "US$ 1.000" },
  { value: 5000, label: "US$ 5.000" },
] as const;

const { usdAmount, isSimulating, clearSimulator } = useRemesasSimulator();
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs font-medium uppercase tracking-wide text-muted">
      Simular cobro
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <UInputNumber
        v-model="usdAmount"
        placeholder="USD"
        :min="usdAmount == null ? undefined : 1"
        :step="1"
        :increment="false"
        :decrement="false"
        :step-snapping="false"
        :disable-wheel-change="true"
        :format-options="{ maximumFractionDigits: 0, useGrouping: false }"
        class="w-36"
      />
      <UButton
        v-for="preset in PRESETS"
        :key="preset.value"
        size="xs"
        color="neutral"
        :variant="usdAmount === preset.value ? 'soft' : 'outline'"
        :label="preset.label"
        @click="usdAmount = preset.value"
      />
      <UButton
        v-if="isSimulating"
        size="xs"
        color="neutral"
        variant="ghost"
        label="Limpiar"
        icon="i-lucide-x"
        @click="clearSimulator"
      />
    </div>
    <p v-if="isSimulating" class="text-xs text-muted">
      Descuenta recibir pagos, retiro a ARS y el precio de venta en vivo. No
      incluye extras no informados.
    </p>
  </div>
</template>
