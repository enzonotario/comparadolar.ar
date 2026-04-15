<script setup lang="ts">
import { provide } from "vue";
import type { ValueType } from "~/composables/useProviderHistory";
import { getDateRange } from "~/composables/useChartData";

interface Props {
  currency: string;
  providerHistories: Array<{
    provider: string;
    data: Array<{
      bid: number;
      ask: number;
      timestamp: string;
      spread: number;
    }>;
  }>;
  selectedRange: string;
  valueType: ValueType;
  providerNames: Record<string, string>;
}

const props = defineProps<Props>();

const colorMode = computed(() => useColorMode().value);

provide(THEME_KEY, colorMode.value);

const renderer = ref("svg");
const initOptions = computed(() => ({
  height: 500,
  width: "auto",
  renderer: renderer.value,
}));
provide(INIT_OPTIONS_KEY, initOptions);

const providerColors = [
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const chartOption = computed(() => {
  if (!props.providerHistories || props.providerHistories.length === 0) {
    return {};
  }

  // Calcular el rango completo basado en selectedRange
  const { start, end } = getDateRange(props.selectedRange);
  const rangeStartTimestamp = start.toISOString();
  const rangeEndTimestamp = end.toISOString();

  const allTimestamps = new Set<string>();

  props.providerHistories.forEach((history) => {
    history.data.forEach((item) => {
      allTimestamps.add(item.timestamp);
    });
  });

  const sortedTimestamps = Array.from(allTimestamps).sort();

  // Usar el rango completo para los límites
  const firstTimestamp = rangeStartTimestamp;
  const lastTimestamp = rangeEndTimestamp;

  // Recopilar todos los timestamps de todas las series (incluyendo computados)
  const allSeriesTimestamps = new Set<string>(sortedTimestamps);
  allSeriesTimestamps.add(firstTimestamp);
  allSeriesTimestamps.add(lastTimestamp);

  const series = props.providerHistories
    .map((history, index) => {
      // Obtener los valores del proveedor según el tipo
      const getValue = (item: { bid: number; ask: number; spread: number }) => {
        if (props.valueType === "bid") {
          return item.bid;
        } else if (props.valueType === "ask") {
          return item.ask;
        } else {
          return item.spread;
        }
      };

      // Ordenar los datos del proveedor por timestamp
      const sortedProviderData = [...history.data].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Obtener el primer y último valor disponible del proveedor
      const firstItem = sortedProviderData[0];
      const lastItem =
        sortedProviderData.length > 0
          ? sortedProviderData[sortedProviderData.length - 1]
          : undefined;

      const firstProviderValue = firstItem ? getValue(firstItem) : null;
      const lastProviderValue = lastItem ? getValue(lastItem) : null;

      const firstProviderTimestamp = firstItem ? firstItem.timestamp : null;
      const lastProviderTimestamp = lastItem ? lastItem.timestamp : null;

      // Crear un mapa de valores por timestamp
      const valueMap = new Map<string, number>();
      sortedProviderData.forEach((item) => {
        valueMap.set(item.timestamp, getValue(item));
      });

      // Construir los datos de la serie
      // Para type: "time", los datos deben ser [timestamp (number), value]
      const data: Array<[number, number]> = [];

      // Si no hay datos del proveedor, no crear la serie
      if (firstProviderValue === null || lastProviderValue === null) {
        return null;
      }

      // Convertir timestamps a números (milisegundos)
      const firstTimestampNum = new Date(firstTimestamp).getTime();
      const lastTimestampNum = new Date(lastTimestamp).getTime();
      const firstProviderTimestampNum = firstProviderTimestamp
        ? new Date(firstProviderTimestamp).getTime()
        : null;

      // Añadir valor computado al inicio solo si el primer valor de la API está DENTRO del rango seleccionado
      // Si el rango comienza antes del primer valor disponible, no extendemos hacia atrás
      if (
        firstProviderTimestampNum &&
        firstProviderTimestampNum >= firstTimestampNum &&
        firstProviderTimestampNum > firstTimestampNum
      ) {
        data.push([firstTimestampNum, firstProviderValue]);
        allSeriesTimestamps.add(firstTimestamp);
      }

      // Añadir todos los datos existentes
      sortedTimestamps.forEach((timestamp) => {
        if (valueMap.has(timestamp)) {
          data.push([new Date(timestamp).getTime(), valueMap.get(timestamp)!]);
          allSeriesTimestamps.add(timestamp);
        }
      });

      // Añadir valor computado al final si es necesario
      if (
        lastProviderTimestamp &&
        new Date(lastProviderTimestamp) < new Date(lastTimestamp)
      ) {
        data.push([lastTimestampNum, lastProviderValue]);
        allSeriesTimestamps.add(lastTimestamp);
      }

      // Ordenar los datos por timestamp para asegurar continuidad
      data.sort((a, b) => a[0] - b[0]);

      const providerName =
        props.providerNames[history.provider] || history.provider;

      return {
        name: providerName,
        type: "line",
        data,
        smooth: true,
        showSymbol: false,
        connectNulls: true,
        sampling: "lttb",
        lineStyle: {
          color: providerColors[index % providerColors.length],
          width: 2,
        },
        itemStyle: {
          color: providerColors[index % providerColors.length],
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: `${providerColors[index % providerColors.length]}4D`,
              },
              {
                offset: 1,
                color: `${providerColors[index % providerColors.length]}0D`,
              },
            ],
          },
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const value = params.value[1];
            if (props.valueType === "spread") {
              return params.seriesName + ": " + formatPercentage(value);
            } else {
              return params.seriesName + ": $" + formatPrice(value);
            }
          },
          backgroundColor: providerColors[index % providerColors.length],
          color: "#fff",
          padding: [2, 4],
          borderRadius: 4,
          fontSize: 12,
          offset: [-10, 0],
        },
        labelLayout: {
          moveOverlap: "shiftY",
        },
        emphasis: {
          focus: "series",
        },
      };
    })
    .filter((s) => s !== null);

  return {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        // params[0].axisValue ya contiene el timestamp formateado cuando usamos type: "time"
        const timestamp = params[0].axisValue || params[0].data[0];
        const date =
          typeof timestamp === "number"
            ? new Date(timestamp)
            : new Date(timestamp);
        const timeString = date.toLocaleString("es-AR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        let tooltip = `<strong>${timeString}</strong><br/>`;
        params.forEach((item: any) => {
          if (props.valueType === "spread") {
            tooltip += `${item.marker} ${item.seriesName}: ${formatPercentage(
              item.data[1],
            )}<br/>`;
          } else {
            tooltip += `${item.marker} ${item.seriesName}: $${formatPrice(
              item.data[1],
            )}<br/>`;
          }
        });
        return tooltip;
      },
    },
    grid: {
      left: "3%",
      right: 140,
      bottom: "10%",
      top: 20,
      outerBoundsMode: "same",
      outerBoundsContain: "axisLabel",
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      min: new Date(firstTimestamp).getTime(),
      max: new Date(lastTimestamp).getTime(),
      axisLabel: {
        formatter: (value: number | string) => {
          const date =
            typeof value === "string" ? new Date(value) : new Date(value);

          if (props.selectedRange === "1d") {
            return date.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (props.selectedRange === "7d") {
            return date.toLocaleDateString("es-AR", {
              month: "2-digit",
              day: "2-digit",
            });
          } else {
            return date.toLocaleDateString("es-AR", {
              month: "2-digit",
              day: "2-digit",
            });
          }
        },
      },
    },
    yAxis: [
      {
        type: "value",
        name: props.valueType === "spread" ? "Spread" : "Precio",
        position: "left",
        axisLabel: {
          formatter: (value: number) =>
            props.valueType === "spread"
              ? `${formatPercentage(value)}`
              : `$${formatPrice(value)}`,
        },
        min: "dataMin",
      },
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        filterMode: "none",
      },
      {
        type: "slider",
        xAxisIndex: [0],
        height: 20,
        bottom: 10,
        start: 0,
        end: 100,
        filterMode: "none",
      },
    ],
    series,
    backgroundColor: "transparent",
  };
});
</script>

<template>
  <div v-if="providerHistories && providerHistories.length > 0" class="w-full">
    <VChart :option="chartOption" class="w-full h-[500px]" autoresize />
  </div>

  <div v-else class="flex items-center justify-center h-[500px]">
    <div class="text-center">
      <UIcon
        name="i-lucide-chart-line"
        class="w-8 h-8 text-gray-400 mx-auto mb-2"
      />
      <p class="text-sm text-gray-500">
        No hay datos disponibles para el rango seleccionado
      </p>
    </div>
  </div>
</template>
