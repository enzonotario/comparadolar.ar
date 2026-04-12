<script setup lang="ts">
import { provide } from "vue";
import { calculateSpread } from "~/lib/utils";

interface HistoryData {
  bid: number;
  ask: number;
  pct_variation: number;
  timestamp: string;
}

const props = defineProps<{
  provider: string;
  currency: string;
}>();

const colorMode = computed(() => useColorMode().value);

provide(THEME_KEY, colorMode.value);

const selectedRange = ref("7d");

const timeRanges = [
  { value: "1d", label: "1 día" },
  { value: "7d", label: "7 días" },
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1a", label: "1 año" },
];

const getDateRange = (range: string) => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case "1d":
      start.setDate(now.getDate() - 1);
      break;
    case "7d":
      start.setDate(now.getDate() - 7);
      break;
    case "1m":
      start.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      start.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(now.getMonth() - 6);
      break;
    case "1a":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
};

const renderer = ref("svg");
const initOptions = computed(() => ({
  height: 400,
  width: "auto",
  renderer: renderer.value,
}));
provide(INIT_OPTIONS_KEY, initOptions);

const apiCurrency = props.currency === "usd-ccl" ? "usd" : props.currency;

const {
  data: historyData,
  pending: isLoading,
  error,
  refresh: refetch,
} = await useFetch<HistoryData[]>(
  `https://api.comparadolar.ar/${apiCurrency}/providers/${props.provider}/history`,
);

const chartData = computed(() => {
  if (!historyData.value) return [];

  const { start, end } = getDateRange(selectedRange.value);

  return historyData.value
    .filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    })
    .map((item) => ({
      bid: item.bid,
      ask: item.ask,
      timestamp: item.timestamp,
      spread: calculateSpread(item.ask, item.bid),
    }));
});

const chartOption = computed(() => {
  if (!chartData.value.length) return {};

  // Calcular el rango completo basado en selectedRange
  const { start, end } = getDateRange(selectedRange.value);
  const rangeStartTimestamp = start.toISOString();
  const rangeEndTimestamp = end.toISOString();

  const times = chartData.value.map((item) => item.timestamp);
  const bidPrices = chartData.value.map((item) => item.bid);
  const askPrices = chartData.value.map((item) => item.ask);
  const spreads = chartData.value.map((item) => item.spread);

  // Obtener el primer y último timestamp del rango
  const firstTimestamp = rangeStartTimestamp;
  const lastTimestamp = rangeEndTimestamp;
  const firstTimestampNum = new Date(firstTimestamp).getTime();
  const lastTimestampNum = new Date(lastTimestamp).getTime();

  // Obtener el primer y último valor disponible
  const firstTime = times[0];
  const lastTime = times[times.length - 1];
  const firstTimeNum = firstTime ? new Date(firstTime).getTime() : null;
  const lastTimeNum = lastTime ? new Date(lastTime).getTime() : null;

  // Preparar datos en formato numérico [timestamp (number), value]
  // Extendemos al inicio solo si el primer valor está DENTRO del rango seleccionado
  const prepareData = (
    values: number[],
    addStart: boolean,
    addEnd: boolean,
  ): Array<[number, number]> => {
    const data: Array<[number, number]> = [];

    if (values.length === 0) return data;

    // Añadir valor computado al inicio solo si el primer valor de la API está DENTRO del rango
    // Si el rango comienza antes del primer valor disponible, no extendemos hacia atrás
    if (
      addStart &&
      firstTimeNum &&
      firstTimeNum >= firstTimestampNum &&
      firstTimeNum > firstTimestampNum &&
      values[0] !== undefined
    ) {
      data.push([firstTimestampNum, values[0]]);
    }

    // Añadir todos los datos existentes
    values.forEach((value, index) => {
      if (times[index]) {
        data.push([new Date(times[index]).getTime(), value]);
      }
    });

    // Añadir valor computado al final si es necesario
    const lastValue = values[values.length - 1];
    if (
      addEnd &&
      lastTimeNum &&
      lastTimeNum < lastTimestampNum &&
      lastValue !== undefined
    ) {
      data.push([lastTimestampNum, lastValue]);
    }

    // Ordenar por timestamp
    return data.sort((a, b) => a[0] - b[0]);
  };

  const bidData = prepareData(
    bidPrices,
    firstTimeNum ? firstTimeNum >= firstTimestampNum : false,
    lastTimeNum ? lastTimeNum < lastTimestampNum : false,
  );
  const askData = prepareData(
    askPrices,
    firstTimeNum ? firstTimeNum >= firstTimestampNum : false,
    lastTimeNum ? lastTimeNum < lastTimestampNum : false,
  );
  const spreadData = prepareData(
    spreads,
    firstTimeNum ? firstTimeNum >= firstTimestampNum : false,
    lastTimeNum ? lastTimeNum < lastTimestampNum : false,
  );

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
          if (item.seriesName === "Spread") {
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
    legend: {
      data: ["Compra", "Venta", "Spread"],
      top: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      min: firstTimestampNum,
      max: lastTimestampNum,
      axisLabel: {
        formatter: (value: number | string) => {
          const date =
            typeof value === "string" ? new Date(value) : new Date(value);

          if (selectedRange.value === "1d") {
            return date.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (selectedRange.value === "7d") {
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
        name: "Precio",
        position: "left",
        axisLabel: {
          formatter: (value: number) => `$${formatPrice(value)}`,
        },
        min: "dataMin",
      },
      {
        type: "value",
        name: "Spread",
        position: "right",
        axisLabel: {
          formatter: (value: number) => `${formatPercentage(value)}`,
        },
        splitLine: {
          show: false,
        },
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
    series: [
      {
        name: "Compra",
        type: "line",
        data: bidData,
        smooth: true,
        showSymbol: false,
        connectNulls: true,
        sampling: "lttb",
        lineStyle: {
          color: "#10b981",
          width: 2,
        },
        itemStyle: {
          color: "#10b981",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Venta",
        type: "line",
        data: askData,
        smooth: true,
        showSymbol: false,
        connectNulls: true,
        sampling: "lttb",
        lineStyle: {
          color: "#ef4444",
          width: 2,
        },
        itemStyle: {
          color: "#ef4444",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Spread",
        type: "bar",
        yAxisIndex: 1,
        data: spreadData,
        itemStyle: {
          color: colorMode.value === "dark" ? "#3f3f46" : "#d4d4d8",
        },
        barWidth: 10,
      },
    ],
    backgroundColor: "transparent",
  };
});

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
</script>

<template>
  <UCard
    :ui="{
      body: '!p-0',
    }"
  >
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          />
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Cotización Histórica
            </h3>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="range in timeRanges"
            :key="range.value"
            :variant="selectedRange === range.value ? 'solid' : 'outline'"
            color="neutral"
            size="xs"
            @click="selectedRange = range.value"
          >
            {{ range.label }}
          </UButton>
        </div>
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">Cargando datos históricos...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-8 h-8 text-red-500 mx-auto mb-2"
        />
        <p class="text-sm text-red-500 mb-2">
          Error al cargar los datos históricos
        </p>
        <UButton size="sm" @click="() => refetch()"> Reintentar </UButton>
      </div>
    </div>

    <div v-else-if="chartData && chartData.length > 0" class="w-full">
      <VChart :option="chartOption" class="w-full h-80" autoresize />
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center">
        <UIcon
          name="i-lucide-chart-line"
          class="w-8 h-8 text-gray-400 mx-auto mb-2"
        />
        <p class="text-sm text-gray-500">No hay datos históricos disponibles</p>
      </div>
    </div>
  </UCard>
</template>
