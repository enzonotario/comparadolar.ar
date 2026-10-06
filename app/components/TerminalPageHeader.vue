<script setup lang="ts">
import type { CurrencyType } from "~/lib/types";

interface Props {
  currency: CurrencyType | Ref<CurrencyType> | ComputedRef<CurrencyType>;
  terminalColors: {
    text: string;
    textSecondary: string;
    chipBorder: string;
  };
  providerCount: number;
  isLoading: boolean;
}

const props = defineProps<Props>();

const resolvedCurrency = computed(() => unref(props.currency));

const updatedAt = computed(() =>
  new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
);
</script>

<template>
  <header class="w-full">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-1 text-center md:text-left">
        <p
          :class="[
            'text-[11px] tracking-[0.14em] uppercase',
            terminalColors.textSecondary,
          ]"
        >
          $ rates monitor
        </p>
        <h1
          :class="[
            'text-xl font-bold tracking-wide sm:text-2xl',
            terminalColors.text,
          ]"
        >
          {{ resolvedCurrency.toUpperCase() }}
        </h1>
        <p :class="`${terminalColors.textSecondary} text-xs`">
          &gt; tasas de cambio en tiempo real_
        </p>
      </div>

      <div class="flex flex-row flex-wrap gap-2 justify-center md:justify-end">
        <template v-if="isLoading">
          <USkeleton class="h-6 w-40 rounded-none" />
          <USkeleton class="h-6 w-44 rounded-none" />
        </template>
        <template v-else>
          <span
            :class="[
              'inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] leading-none',
              terminalColors.textSecondary,
              terminalColors.chipBorder,
            ]"
          >
            <span class="opacity-70">PROVEEDORES</span>
            <span class="font-bold">{{ providerCount }}</span>
          </span>
          <span
            :class="[
              'inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] leading-none',
              terminalColors.textSecondary,
              terminalColors.chipBorder,
            ]"
          >
            <span class="opacity-70">UPD</span>
            <span class="font-bold">{{ updatedAt }}</span>
          </span>
        </template>
      </div>
    </div>
  </header>
</template>
