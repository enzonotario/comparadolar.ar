<script setup lang="ts">
interface DolarData {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

const dolares = ref<DolarData[]>([]);
const loading = ref(true);
const error = ref(false);

const isDesktop = ref(false);
let interval: ReturnType<typeof setInterval> | undefined;
let mediaQuery: MediaQueryList | undefined;

const handleDesktopChange = (e: MediaQueryListEvent) => {
  isDesktop.value = e.matches;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatUpdateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const lastUpdate = computed(() => {
  if (dolares.value.length === 0) return new Date().toISOString();

  const latestDate = Math.max(
    ...dolares.value.map((d) => new Date(d.fechaActualizacion).getTime()),
  );
  return new Date(latestDate).toISOString();
});

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await fetch("https://dolarapi.com/v1/dolares");
    if (!response.ok) {
      throw new Error("Error al obtener los datos");
    }
    const data = await response.json();
    dolares.value = data;
    error.value = false;
  } catch (err) {
    console.error("Error fetching dolar data:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const checkIsDesktop = () => {
  if (import.meta.client) {
    isDesktop.value = window.matchMedia("(min-width: 768px)").matches;
  }
};

onMounted(() => {
  const defer =
    window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1));

  defer(() => {
    checkIsDesktop();

    mediaQuery = window.matchMedia("(min-width: 768px)");
    mediaQuery.addEventListener("change", handleDesktopChange);
  });

  defer(() => {
    fetchData();
  });

  interval = setInterval(
    () => {
      fetchData();
    },
    5 * 60 * 1000,
  );
});

onUnmounted(() => {
  mediaQuery?.removeEventListener("change", handleDesktopChange);
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <div
    v-if="isDesktop && !error"
    class="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white text-xs py-1 overflow-hidden border-b border-gray-200 dark:border-gray-800"
  >
    <div v-if="loading" class="flex items-center justify-center gap-6 px-4">
      <USkeleton class="h-4 w-24" />
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-4 w-28" />
      <USkeleton class="h-4 w-28" />
      <USkeleton class="h-4 w-28" />
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-4 w-24" />
    </div>

    <UMarquee
      v-else
      :overlay="false"
      :ui="{ root: '[--gap:--spacing(6)] [--duration:60s]', content: 'w-auto' }"
      class="[&>*]:will-change-transform"
      pause-on-hover
    >
      <span class="text-gray-500 dark:text-gray-400">
        Actualizado: {{ formatUpdateTime(lastUpdate) }}
      </span>

      <div
        v-for="dolar in dolares"
        :key="dolar.casa"
        class="flex items-center space-x-2 shrink-0"
      >
        <span class="font-medium">{{ dolar.nombre }}:</span>
        <span class="text-emerald-600 dark:text-emerald-400">{{
          formatPrice(dolar.compra)
        }}</span>
        <span>/</span>
        <span class="text-indigo-600 dark:text-indigo-400">{{
          formatPrice(dolar.venta)
        }}</span>
      </div>
    </UMarquee>
  </div>
</template>
