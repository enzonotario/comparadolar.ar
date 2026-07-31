<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";
import { getProviderDisplayName } from "@/lib/provider-display";
import { getProviderConditions } from "@/lib/provider-conditions";

interface Props {
  rate: ExchangeRate;
  currency: string;
  activeTab: "buy" | "sell";
}

const props = defineProps<Props>();

const conditions = computed(() => getProviderConditions(props.rate));

const hasValidSpread = computed(() => {
  return (
    props.rate.ask != null &&
    props.rate.ask > 0 &&
    props.rate.bid != null &&
    props.rate.bid > 0
  );
});

const getSpread = computed(() => {
  if (!hasValidSpread.value) return 0;
  return props.rate.ask! - props.rate.bid!;
});

const getSpreadPercentage = computed(() => {
  if (!hasValidSpread.value) return "0.00";
  const spread = getSpread.value;
  const midPrice = (props.rate.ask! + props.rate.bid!) / 2;
  return ((spread / midPrice) * 100).toFixed(2);
});

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/assets/placeholder.svg";
};
</script>

<template>
  <div :class="rate.sponsoredBanner ? 'space-y-3' : undefined">
    <NuxtLink
      v-if="!rate.sponsoredBanner"
      :to="`/${currency}/${rate.slug}`"
      class="hover:underline"
    >
      <div class="flex items-center gap-3">
        <img
          :src="rate.logoUrl || rate.logo || '/assets/placeholder.svg'"
          :alt="getProviderDisplayName(rate)"
          class="h-8 w-8 rounded-full"
          @error="handleImageError"
        />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ getProviderDisplayName(rate) }}
            </h3>
            <UBadge v-if="rate.is24x7" color="success" size="xs"> 24/7 </UBadge>
            <UBadge v-if="rate.isUsdCcl" color="info" size="xs"> CCL </UBadge>
            <UsdTypeBadge
              :usd-type="rate.usdType"
              :slug="rate.slug"
              :name="rate.name"
            />
            <UBadge
              v-if="conditions"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Con condiciones
            </UBadge>
          </div>
          <p
            v-if="hasValidSpread"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            Spread: {{ getSpreadPercentage }}%
          </p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">
            Spread: N/A
          </p>
          <p
            v-if="conditions"
            class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
          >
            <UIcon
              name="i-heroicons-information-circle"
              class="h-3.5 w-3.5 shrink-0"
            />
            {{ conditions }}
          </p>
        </div>
      </div>
    </NuxtLink>

    <template v-else>
      <div class="flex items-center gap-3">
        <img
          :src="rate.logoUrl || rate.logo || '/assets/placeholder.svg'"
          :alt="getProviderDisplayName(rate)"
          class="h-8 w-8 rounded-full"
          @error="handleImageError"
        />
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ getProviderDisplayName(rate) }}
            </h3>
            <UBadge v-if="rate.is24x7" color="success" size="xs"> 24/7 </UBadge>
            <UsdTypeBadge
              :usd-type="rate.usdType"
              :slug="rate.slug"
              :name="rate.name"
            />
            <UBadge
              color="warning"
              variant="solid"
              size="xs"
              class="!font-semibold tracking-wide"
            >
              La mejor cotización
            </UBadge>
          </div>
          <p
            v-if="hasValidSpread"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            Spread: {{ getSpreadPercentage }}%
          </p>
        </div>
      </div>

      <a
        href="https://voii.com.ar/"
        target="_blank"
        rel="noopener noreferrer"
        class="voii-banner group relative mx-auto block w-full max-w-[468px] overflow-hidden rounded-md shadow-sm ring-1 ring-amber-300/70 transition hover:ring-amber-400 dark:ring-amber-600/50 sm:mx-0"
        style="aspect-ratio: 468 / 60"
        aria-label="Banner Banco Voii 468x60 (mockup)"
        @click.stop
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-[#FFD100] via-[#FFE566] to-[#FFF3B0]"
        />
        <div
          class="absolute inset-0 opacity-[0.12]"
          style="
            background-image: radial-gradient(
              circle at 20% 50%,
              #000 1px,
              transparent 1px
            );
            background-size: 8px 8px;
          "
        />
        <div
          class="relative flex h-full items-center justify-between gap-3 px-3 sm:px-4"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <img
              src="https://api.argentinadatos.com/static/logos/banco-voii.jpg"
              alt="Banco Voii"
              class="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <div class="min-w-0 leading-tight">
              <p
                class="truncate text-[11px] font-black uppercase tracking-wide text-zinc-900 sm:text-xs"
              >
                Banco Voii
              </p>
              <p
                class="truncate text-[10px] font-medium text-zinc-800/80 sm:text-[11px]"
              >
                Operá dólares al mejor precio
              </p>
            </div>
          </div>
          <span
            class="shrink-0 rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-[#FFD100] transition group-hover:bg-zinc-800 sm:text-[11px]"
          >
            Conocer más →
          </span>
        </div>
      </a>
    </template>
  </div>
</template>

<style scoped>
.voii-banner {
  height: auto;
  max-height: 60px;
}
@media (min-width: 468px) {
  .voii-banner {
    width: 468px;
    height: 60px;
    max-height: none;
    aspect-ratio: auto;
  }
}
</style>
