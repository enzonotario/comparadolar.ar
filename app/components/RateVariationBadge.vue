<script setup lang="ts">
interface Props {
  value?: number | null;
}

const props = defineProps<Props>();

const hasVariation = computed(() => {
  return props.value != null && Number.isFinite(props.value);
});

const variationDirection = computed<"up" | "down" | "flat">(() => {
  const value = props.value ?? 0;
  if (!hasVariation.value || value === 0) return "flat";
  return value > 0 ? "up" : "down";
});

const badgeColor = computed(() => {
  if (variationDirection.value === "up") return "success";
  if (variationDirection.value === "down") return "error";
  return "neutral";
});

const badgeIcon = computed(() => {
  if (variationDirection.value === "up") return "i-lucide-trending-up";
  if (variationDirection.value === "down") return "i-lucide-trending-down";
  return "i-lucide-minus";
});

const formattedVariation = computed(() => {
  if (!hasVariation.value) return "";

  const value = props.value ?? 0;
  const sign = value > 0 ? "+" : "";
  const formattedValue = Math.abs(value).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${sign}${value < 0 ? "-" : ""}${formattedValue}%`;
});

const title = computed(() => {
  if (variationDirection.value === "up") return "Subio";
  if (variationDirection.value === "down") return "Bajo";
  return "Sin cambios";
});
</script>

<template>
  <UBadge
    v-if="hasVariation"
    :color="badgeColor"
    variant="soft"
    size="xs"
    :icon="badgeIcon"
    :title="`${title}: ${formattedVariation}`"
    :class="[
      variationDirection === 'up'
        ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-50'
        : variationDirection === 'down'
          ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-50'
          : 'bg-neutral-50 dark:bg-neutral-900/30 text-neutral-800 dark:text-neutral-50',
    ]"
    class="font-mono tabular-nums"
  >
    {{ formattedVariation }}
  </UBadge>
</template>
