<script setup lang="ts">
interface Props {
  values: number[];
  /** Window label shown next to the sparkline (API default: 7d). */
  rangeLabel?: string;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rangeLabel: "7d",
  width: 72,
  height: 28,
});

const points = computed(() => {
  const values = props.values.filter((v) => Number.isFinite(v) && v > 0);
  if (values.length < 2) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 2;
  const w = props.width;
  const h = props.height - padY * 2;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * w;
      const y = padY + (1 - (value - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
});

const trend = computed(() => {
  const values = props.values.filter((v) => Number.isFinite(v) && v > 0);
  if (values.length < 2) return "flat" as const;
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const delta = last - first;
  const threshold = Math.abs(first) * 0.0005; // 0.05% noise floor
  if (Math.abs(delta) <= threshold) return "flat" as const;
  return delta > 0 ? ("up" as const) : ("down" as const);
});

const strokeClass = computed(() => {
  if (trend.value === "up") return "stroke-emerald-500 dark:stroke-emerald-400";
  if (trend.value === "down") return "stroke-rose-500 dark:stroke-rose-400";
  return "stroke-zinc-400 dark:stroke-zinc-500";
});

const ariaLabel = computed(() => {
  const direction =
    trend.value === "up"
      ? "al alza"
      : trend.value === "down"
        ? "a la baja"
        : "estable";
  return `Tendencia ${props.rangeLabel} ${direction}`;
});
</script>

<template>
  <div
    v-if="points"
    class="inline-flex items-end gap-1"
    :aria-label="ariaLabel"
    role="img"
  >
    <div class="flex flex-col items-stretch gap-0.5">
      <svg
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        class="overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <polyline
          fill="none"
          :class="strokeClass"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="points"
        />
      </svg>
      <div
        class="flex justify-between px-px text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
        aria-hidden="true"
      >
        <span>−{{ rangeLabel }}</span>
        <span>hoy</span>
      </div>
    </div>
  </div>
</template>
