<script setup lang="ts">
const { secondsLeft, isRefreshing, isPaused, progress, refreshNow } =
  useAutoRefresh();

const countdownLabel = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60);
  const seconds = secondsLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

const tooltipText = computed(() => {
  if (isRefreshing.value) return "Actualizando datos…";
  if (isPaused.value) return "Auto-recarga pausada en segundo plano";
  return `Próxima actualización en ${countdownLabel.value}`;
});
</script>

<template>
  <UTooltip :text="tooltipText" :content="{ side: 'bottom' }">
    <button
      type="button"
      class="relative inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-md border border-zinc-200 bg-white/70 px-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900"
      :aria-label="tooltipText"
      @click.stop.prevent="refreshNow"
    >
      <UIcon
        :name="isRefreshing ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
        class="size-3.5 shrink-0"
        :class="{ 'animate-spin': isRefreshing }"
      />
      <span class="tabular-nums leading-none">{{ countdownLabel }}</span>
      <span
        class="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-200 dark:bg-zinc-800"
        aria-hidden="true"
      >
        <span
          class="block h-full bg-primary-500 transition-[width] duration-300 ease-linear"
          :style="{ width: `${progress}%` }"
        />
      </span>
    </button>
  </UTooltip>
</template>
