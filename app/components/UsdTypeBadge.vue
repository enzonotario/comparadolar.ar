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

const colorClass = computed(() => {
  if (!props.usdType) return "";
  const color = getUsdTypeBadgeColor(props.usdType);
  if (color === "warning") return "bg-warning text-inverted";
  if (color === "secondary") return "bg-secondary text-inverted";
  return "bg-inverted text-inverted";
});
</script>

<template>
  <span
    v-if="visible && props.usdType"
    class="usd-type-badge shrink-0"
    :class="colorClass"
  >
    <span class="usd-type-badge__label">{{ props.usdType }}</span>
  </span>
</template>
