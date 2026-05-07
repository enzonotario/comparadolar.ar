<script setup lang="ts">
const {
  canInstall,
  isInstalled,
  serviceWorkerReady,
  serviceWorkerSupported,
  install,
} = usePwaInstall();

const showInstructions = ref(false);

const buttonLabel = computed(() => {
  if (isInstalled.value) return "Desinstalar app";
  return canInstall.value ? "Instalar app" : "Cómo instalar app";
});

const buttonIcon = computed(() => {
  if (isInstalled.value) return "i-lucide-trash-2";
  return canInstall.value ? "i-lucide-download" : "i-lucide-info";
});

const instructionsTitle = computed(() => {
  if (isInstalled.value) return "Cómo desinstalar la PWA";
  return "Cómo instalar la PWA";
});

const instructions = computed(() => {
  if (isInstalled.value) {
    return [
      "Desde la app instalada, abrí el menú del navegador o de la ventana.",
      "Elegí “Desinstalar ComparaDólar” o “Quitar de este dispositivo”.",
      "En Android/iOS también podés mantener presionado el ícono y elegir eliminar.",
    ];
  }

  return [
    "Si aparece el prompt nativo, confirmá “Instalar”.",
    "Si no aparece, abrí el menú del navegador y elegí “Instalar app”.",
    "En mobile, usá “Agregar a pantalla de inicio”.",
  ];
});

const handleClick = async () => {
  if (!isInstalled.value) {
    const prompted = await install();
    if (prompted) return;
  }

  showInstructions.value = !showInstructions.value;
};
</script>

<template>
  <div class="space-y-3">
    <UButton
      color="neutral"
      variant="outline"
      class="space-x-2"
      :icon="buttonIcon"
      @click.stop.prevent="handleClick"
    >
      {{ buttonLabel }}
    </UButton>

    <div
      v-if="showInstructions"
      class="max-w-xl space-y-3 rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200"
    >
      <div class="space-y-1">
        <p class="font-semibold text-zinc-950 dark:text-white">
          {{ instructionsTitle }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          El botón nativo de instalación solo aparece cuando el navegador lo
          habilita. La desinstalación no puede hacerse automáticamente desde
          JavaScript.
        </p>
      </div>

      <ol class="list-decimal space-y-1 pl-4 text-xs leading-5">
        <li v-for="instruction in instructions" :key="instruction">
          {{ instruction }}
        </li>
      </ol>

      <div
        class="rounded-md bg-zinc-50 p-2 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
      >
        Service Worker:
        {{
          serviceWorkerSupported
            ? serviceWorkerReady
              ? "activo"
              : "registrando…"
            : "no soportado"
        }}
      </div>
    </div>
  </div>
</template>
