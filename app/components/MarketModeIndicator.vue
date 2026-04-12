<script setup lang="ts">
const { marketMode } = useMarketMode();

interface ModeInfo {
  icon: string;
  label: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconClass: string;
}

const modeInfo = computed<ModeInfo>(() => {
  switch (marketMode.value) {
    case "after":
      return {
        icon: "i-heroicons-moon",
        label: "After Hours",
        description: "Mostrando solo proveedores 24/7",
        bgClass: "bg-indigo-500/10",
        borderClass: "border-indigo-500/20",
        textClass: "text-indigo-800 dark:text-indigo-200",
        iconClass: "text-indigo-800 dark:text-indigo-200",
      };
    case "pre":
      return {
        icon: "i-heroicons-sun",
        label: "Pre Market",
        description: "Mostrando solo proveedores 24/7",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/20",
        textClass: "text-amber-800 dark:text-amber-200",
        iconClass: "text-amber-800 dark:text-amber-200",
      };
    case "weekend":
      return {
        icon: "i-heroicons-cake",
        label: "Weekend Mode",
        description: "Mostrando solo proveedores 24/7",
        bgClass: "bg-emerald-500/10",
        borderClass: "border-emerald-500/20",
        textClass: "text-emerald-800 dark:text-emerald-200",
        iconClass: "text-emerald-800 dark:text-emerald-200",
      };
    default:
      return {
        icon: "i-heroicons-clock",
        label: "Normal",
        description: "Todos los proveedores disponibles",
        bgClass: "bg-zinc-500/10",
        borderClass: "border-zinc-500/20",
        textClass: "text-zinc-800 dark:text-zinc-200",
        iconClass: "text-zinc-800 dark:text-zinc-200",
      };
  }
});
</script>

<template>
  <div
    v-if="marketMode !== 'normal'"
    :class="[
      'mb-3 py-1.5 px-3 rounded-md border flex items-center justify-center gap-2 text-sm',
      modeInfo.bgClass,
      modeInfo.borderClass,
    ]"
  >
    <UIcon :name="modeInfo.icon" :class="['w-3.5 h-3.5', modeInfo.iconClass]" />
    <span :class="['font-medium', modeInfo.textClass]">
      {{ modeInfo.label }}
    </span>
    <span class="text-zinc-800 dark:text-zinc-200 hidden sm:inline">
      • {{ modeInfo.description }}
    </span>
  </div>
</template>
