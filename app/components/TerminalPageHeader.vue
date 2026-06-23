<script setup lang="ts">
import type { CurrencyType } from "~/lib/types";

interface Props {
  currency: CurrencyType | Ref<CurrencyType> | ComputedRef<CurrencyType>;
  terminalColors: {
    text: string;
    textSecondary: string;
    ring: string;
  };
  providerCount: number;
  isLoading: boolean;
}

const props = defineProps<Props>();

const resolvedCurrency = computed(() => unref(props.currency));
</script>

<template>
  <header class="w-full">
    <div
      class="flex flex-col md:flex-row md:justify-between md:items-end w-full gap-2"
    >
      <div class="flex flex-col gap-2 text-center md:text-left">
        <h1 :class="['text-2xl font-bold', terminalColors.text]">
          $ RATES MONITOR
        </h1>
        <p :class="`${terminalColors.textSecondary} text-sm`">
          Tasas de cambio en tiempo real
        </p>
      </div>

      <div class="flex flex-row flex-wrap gap-2 justify-center md:justify-end">
        <template v-if="isLoading">
          <USkeleton class="h-6 w-40" />
          <USkeleton class="h-6 w-44" />
        </template>
        <template v-else>
          <UBadge
            :class="[terminalColors.textSecondary, terminalColors.ring]"
            size="sm"
            variant="subtle"
            color="neutral"
          >
            Proveedores {{ resolvedCurrency.toUpperCase() }}:
            <span class="font-mono">{{ providerCount }}</span>
          </UBadge>
          <UBadge
            :class="[terminalColors.textSecondary, terminalColors.ring]"
            size="sm"
            variant="subtle"
            color="neutral"
          >
            Última actualización:
            {{
              new Date().toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            }}
          </UBadge>
        </template>
      </div>
    </div>
  </header>
</template>
