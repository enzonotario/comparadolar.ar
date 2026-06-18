<script setup lang="ts">
import {
  getUsdTypeBadgeColor,
  shouldShowUsdTypeBadge,
} from "~/lib/market-constants";
import type { UsdProviderType } from "~/lib/types";

interface Props {
  usdType?: UsdProviderType;
  slug?: string;
  name?: string;
}

const props = defineProps<Props>();

const visible = computed(() => shouldShowUsdTypeBadge(props));
</script>

<template>
  <UBadge
    v-if="visible && props.usdType"
    :color="getUsdTypeBadgeColor(props.usdType)"
    size="xs"
  >
    {{ props.usdType }}
  </UBadge>
</template>
