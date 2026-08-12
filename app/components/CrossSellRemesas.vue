<script setup lang="ts">
import { getCurrencyColorScheme } from "~/lib/currencies-config";

const route = useRoute();
const colorScheme = computed(() =>
  getCurrencyColorScheme(route.params.currency as string),
);

const cardClasses = computed(() => {
  const map: Record<string, { bg: string }> = {
    green: {
      bg: "bg-green-50/60 dark:bg-green-950/20",
    },
    cyan: {
      bg: "bg-cyan-50/60 dark:bg-cyan-950/20",
    },
    teal: {
      bg: "bg-teal-50/60 dark:bg-teal-950/20",
    },
    orange: {
      bg: "bg-orange-50/60 dark:bg-orange-950/20",
    },
    violet: {
      bg: "bg-violet-50/60 dark:bg-violet-950/20",
    },
  };
  return map[colorScheme.value] || map.green;
});

const linkClass = computed(() => {
  const map: Record<string, string> = {
    green: "text-green-600 dark:text-green-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    teal: "text-teal-600 dark:text-teal-400",
    orange: "text-orange-600 dark:text-orange-400",
    violet: "text-violet-600 dark:text-violet-400",
  };
  return map[colorScheme.value] || map.green;
});
</script>

<template>
  <UCard :class="[cardClasses.bg]" class="mx-auto">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div class="space-y-1">
        <p class="text-sm font-semibold">¿Cobrás del exterior?</p>
        <p class="text-sm text-muted">
          Mirá la comparativa de remesas en
          <NuxtLink to="/remesas" :class="[linkClass, 'hover:underline']">
            comparadolar.ar/remesas
          </NuxtLink>
          , con el precio de venta del dólar en vivo.
        </p>
      </div>

      <UButton
        to="/remesas"
        icon="i-lucide-arrow-right"
        trailing
        :color="colorScheme"
      >
        Ver remesas
      </UButton>
    </div>
  </UCard>
</template>
