<script setup lang="ts">
interface Props {
  lastUpdate: Date;
  isLoading?: boolean;
  isRetrying?: boolean;
  onRefresh: () => Promise<void> | void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isRetrying: false,
});

const isMobile = ref(false);
const isAnimating = ref(false);

onMounted(() => {
  if (import.meta.client) {
    const defer =
      window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1));

    defer(() => {
      isMobile.value = window.innerWidth < 768;
      window.addEventListener(
        "resize",
        () => {
          isMobile.value = window.innerWidth < 768;
        },
        { passive: true },
      );
    });
  }
});

const formattedTime = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return props.lastUpdate.toLocaleTimeString("es-AR", options);
});

const handleRefresh = async () => {
  isAnimating.value = true;

  try {
    await props.onRefresh();
  } catch (error) {
    console.error("Error al actualizar:", error);
  } finally {
    setTimeout(() => {
      isAnimating.value = false;
    }, 500);
  }
};
</script>

<template>
  <div class="flex justify-between items-center mb-4 gap-4">
    <div class="text-sm text-gray-500 dark:text-white/60 self-end">
      <span v-if="isMobile">Actualizado:</span>
      <span v-else>Última actualización:</span>
      {{ formattedTime }}
    </div>

    <UButton
      :disabled="isLoading || isRetrying"
      :loading="isLoading || isRetrying"
      color="neutral"
      variant="soft"
      size="sm"
      icon="i-heroicons-arrow-path"
      :class="{ 'animate-spin-slow': isAnimating }"
      @click="handleRefresh"
    >
      <span v-if="isMobile">Actualizar</span>
      <span v-else>Actualizar datos</span>
    </UButton>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 0.5s linear;
  will-change: transform;
}
</style>
