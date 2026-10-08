import { d3Curve } from "@tanstack/charts";
import { curveMonotoneX } from "d3-shape";
import { useColorMode } from "#imports";
import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export const PROVIDER_COLORS = [
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

export const smoothCurve = d3Curve(curveMonotoneX);

const priceFormat = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormat = new Intl.NumberFormat("es-AR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: number) {
  return priceFormat.format(price);
}

/** El spread llega como porcentaje (1.5 = 1,50%). */
export function formatSpread(value: number) {
  return percentFormat.format(value / 100);
}

export function formatAxisDate(value: Date, range: string) {
  if (range === "1d") {
    return value.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value.toLocaleDateString("es-AR", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTooltipDate(value: Date) {
  return value.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function paddedDomain(
  values: readonly number[],
  padRatio = 0.08,
): [number, number] {
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    return [min - pad, max + pad];
  }
  const pad = (max - min) * padRatio;
  return [min - pad, max + pad];
}

export interface TimedValue {
  timestamp: string;
  value: number;
}

/**
 * Extiende el primer valor hasta el inicio del rango solo si ese primer punto
 * ya cae adentro, y el último valor hasta el fin del rango.
 */
export function extendSeriesToRange(
  items: readonly TimedValue[],
  rangeStart: Date,
  rangeEnd: Date,
): Array<{ x: Date; y: number }> {
  const sorted = [...items].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return [];

  const startMs = rangeStart.getTime();
  const endMs = rangeEnd.getTime();
  const firstMs = new Date(first.timestamp).getTime();
  const lastMs = new Date(last.timestamp).getTime();
  const data: Array<{ x: Date; y: number }> = [];

  if (firstMs > startMs) {
    data.push({ x: new Date(startMs), y: first.value });
  }

  for (const item of sorted) {
    data.push({ x: new Date(item.timestamp), y: item.value });
  }

  if (lastMs < endMs) {
    data.push({ x: new Date(endMs), y: last.value });
  }

  data.sort((a, b) => a.x.getTime() - b.x.getTime());
  return data;
}

export function useChartInk() {
  const colorMode = useColorMode();
  const isDark = computed(() => colorMode.value === "dark");

  return {
    isDark,
    textColor: computed(() => (isDark.value ? "#f4f4f5" : "#18181b")),
    mutedColor: computed(() => (isDark.value ? "#a1a1aa" : "#71717a")),
    gridColor: computed(() => (isDark.value ? "#3f3f46" : "#e4e4e7")),
  };
}

export function useZoomWindow(
  extent: ComputedRef<readonly [Date, Date] | null>,
) {
  const zoomWindow = ref<{ start: Date; end: Date } | null>(null);

  watch(
    extent,
    (value) => {
      zoomWindow.value = value ? { start: value[0], end: value[1] } : null;
    },
    { immediate: true },
  );

  return zoomWindow as Ref<{ start: Date; end: Date } | null>;
}

interface ZoomPlotRenderContext {
  container: HTMLElement;
  interaction: {
    resolvePointer: (clientX: number, clientY: number) => unknown;
    setControlledFocus: (
      target: unknown,
      options?: { source?: "pointer" },
    ) => void;
  };
}

/** El overlay de zoomX tapa el plot y el host borra el foco. Esto lo restaura. */
export function useZoomPlotHover() {
  let detach: (() => void) | undefined;

  function onRender(context: ZoomPlotRenderContext) {
    detach?.();

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !target.closest("[data-chart-zoom-surface]")
      ) {
        return;
      }
      context.interaction.setControlledFocus(
        context.interaction.resolvePointer(event.clientX, event.clientY),
        { source: "pointer" },
      );
    };

    context.container.addEventListener("pointermove", onPointerMove);
    detach = () =>
      context.container.removeEventListener("pointermove", onPointerMove);
  }

  onBeforeUnmount(() => detach?.());

  return { onRender };
}

/** Separa etiquetas de fin de serie que se pisan, empujando hacia abajo. */
export function shiftOverlappingEndLabels(svg: SVGSVGElement) {
  const labels = [...svg.querySelectorAll<SVGTextElement>("text")].filter(
    (text) =>
      text.getAttribute("font-weight") === "700" &&
      !text.closest(".ts-chart__legend"),
  );
  labels.sort(
    (a, b) => Number(a.getAttribute("y")) - Number(b.getAttribute("y")),
  );

  for (let index = 1; index < labels.length; index++) {
    const previous = labels[index - 1];
    const current = labels[index];
    if (!previous || !current) continue;
    const previousBox = previous.getBBox();
    const box = current.getBBox();
    const overlap = previousBox.y + previousBox.height + 4 - box.y;
    if (overlap <= 0 || Math.abs(previousBox.x - box.x) > 80) continue;
    const nextY = Number(current.getAttribute("y")) + overlap;
    current.setAttribute("y", String(nextY));
  }
}
