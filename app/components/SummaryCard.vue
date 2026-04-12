<script setup lang="ts">
import type { ExchangeRate } from "@/lib/types";

interface Props {
  title: string;
  icon: string;
  iconClass: string;
  data: ExchangeRate | ExchangeRate[] | null;
  value: number;
  currency: string;
}

const props = defineProps<Props>();

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/placeholder.svg";
};

const providers = computed(() => {
  if (!props.data) return [];
  return Array.isArray(props.data) ? props.data : [props.data];
});

const hasMultipleProviders = computed(() => providers.value.length > 1);
</script>

<template>
  <UCard
    :class="[
      !hasMultipleProviders && providers[0]?.url
        ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex-1'
        : '',
    ]"
    :ui="{
      body: '!p-0 h-full',
    }"
  >
    <!--    <NuxtLink :to="`/${currency}/${data?.slug}`" class="block">-->
    <NuxtLink
      :to="
        !hasMultipleProviders && providers[0]?.url
          ? `/${currency}/${providers[0]?.slug}`
          : ''
      "
      :class="[!hasMultipleProviders ? 'p-4 sm:p-6' : '']"
      class="block h-full"
    >
      <div
        :class="[hasMultipleProviders ? 'pt-4 px-4 sm:pt-6 sm:px-6' : '']"
        class="flex items-center justify-between mb-4"
      >
        <div class="flex items-center space-x-2">
          <UIcon :name="icon" :class="iconClass" />
          <h3 class="text-sm font-medium text-zinc-900 dark:text-white">
            {{ title }}
          </h3>
        </div>
        <UIcon
          v-if="!hasMultipleProviders"
          name="i-heroicons-chevron-right-solid"
          class="w-4 h-4 text-zinc-400"
        />
      </div>
      <div class="space-y-2">
        <div
          :class="[hasMultipleProviders ? 'px-4 sm:px-6' : '']"
          class="text-2xl font-bold text-zinc-900 dark:text-white"
        >
          <USkeleton v-if="providers.length === 0" class="h-8 w-32" />
          <template v-else>
            ${{
              value.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </template>
        </div>

        <div v-if="hasMultipleProviders" class="space-y-2">
          <NuxtLink
            v-for="provider in providers"
            :key="provider.slug"
            :to="`/${currency}/${provider.slug}`"
            class="flex items-center space-x-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <img
              :src="provider.logoUrl || provider.logo || '/placeholder.svg'"
              :alt="provider.prettyName || provider.name"
              class="w-6 h-6 rounded-full flex-shrink-0"
              @error="handleImageError"
            />
            <span
              class="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
            >
              {{ provider.prettyName || provider.name }}
            </span>
            <UBadge v-if="provider?.is24x7" color="success" size="xs">
              24/7
            </UBadge>
            <UBadge
              v-if="provider?.isUsdCcl && currency !== 'usd-ccl'"
              color="blue"
              size="xs"
            >
              CCL
            </UBadge>
            <span class="flex-1" />
            <UIcon
              name="i-heroicons-chevron-right-solid"
              class="w-4 h-4 text-zinc-400"
            />
          </NuxtLink>
        </div>

        <div
          v-else-if="providers.length === 1"
          class="flex items-center space-x-2"
        >
          <img
            :src="
              providers[0].logoUrl || providers[0].logo || '/placeholder.svg'
            "
            :alt="providers[0].prettyName || providers[0].name"
            class="w-6 h-6 rounded-full"
            @error="handleImageError"
          />
          <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {{ providers[0].prettyName || providers[0].name }}
          </span>
          <UBadge v-if="providers[0]?.is24x7" color="success" size="xs">
            24/7
          </UBadge>
          <UBadge
            v-if="providers[0]?.isUsdCcl && currency !== 'usd-ccl'"
            color="blue"
            size="xs"
          >
            CCL
          </UBadge>
        </div>

        <div v-else class="flex items-center space-x-2">
          <USkeleton class="h-6 w-6 rounded-full" />
          <USkeleton class="h-5 w-24" />
        </div>
      </div>
    </NuxtLink>
  </UCard>
</template>
