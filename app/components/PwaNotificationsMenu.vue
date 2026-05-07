<script setup lang="ts">
import { currencies } from "~/lib/currencies-config";
import type { Top3NotificationMode } from "~/composables/useTop3Notifications";

const { canInstall, isInstalled, serviceWorkerReady, install } =
  usePwaInstall();
const {
  preferences,
  permission,
  supportsNotifications,
  enabledCurrencies,
  isChecking,
  requestPermission,
  setEnabled,
  toggleCurrency,
  setNotifyOn,
  checkNow,
} = useTop3Notifications();

const notifyModes: Array<{ value: Top3NotificationMode; label: string }> = [
  { value: "both", label: "Compra y venta" },
  { value: "buy", label: "Solo compra" },
  { value: "sell", label: "Solo venta" },
];

const statusLabel = computed(() => {
  if (!supportsNotifications.value) return "No soportadas";
  if (permission.value === "granted" && preferences.value.enabled)
    return "Activas";
  if (permission.value === "denied") return "Bloqueadas";
  return "Inactivas";
});

const statusColor = computed<"success" | "error" | "neutral">(() => {
  if (permission.value === "granted" && preferences.value.enabled)
    return "success";
  if (permission.value === "denied") return "error";
  return "neutral";
});

const iconName = computed(() =>
  preferences.value.enabled ? "i-lucide-bell-ring" : "i-lucide-bell",
);

const handleEnableClick = async () => {
  if (permission.value !== "granted") {
    await requestPermission();
    return;
  }

  await setEnabled(!preferences.value.enabled);
};

const handleModeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement)
    .value as Top3NotificationMode;
  void setNotifyOn(value);
};
</script>

<template>
  <UPopover :content="{ side: 'bottom', align: 'end' }">
    <UButton
      class="h-7"
      color="neutral"
      :variant="preferences.enabled ? 'soft' : 'ghost'"
      square
      :icon="iconName"
      aria-label="Configurar PWA y notificaciones"
      @click.stop
    />

    <template #content>
      <div
        class="w-80 max-w-[calc(100vw-2rem)] space-y-4 p-4 text-sm text-zinc-700 dark:text-zinc-200"
        @click.stop
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-zinc-950 dark:text-white">
              App y alertas Top 3
            </p>
            <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Recibí avisos si cambia el ranking de compra o venta.
            </p>
          </div>
          <UBadge :color="statusColor" variant="soft" size="xs">
            {{ statusLabel }}
          </UBadge>
        </div>

        <div
          class="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-medium">Instalar app</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Abrí ComparaDólar como PWA desde el escritorio.
              </p>
            </div>
            <UButton
              v-if="canInstall"
              size="xs"
              color="primary"
              variant="soft"
              @click.stop="install"
            >
              Instalar
            </UButton>
            <UBadge
              v-else-if="isInstalled"
              color="success"
              variant="soft"
              size="xs"
            >
              Instalada
            </UBadge>
          </div>
          <p
            v-if="!canInstall && !isInstalled"
            class="text-xs text-zinc-500 dark:text-zinc-400"
          >
            Si tu navegador lo permite, usá “Agregar a pantalla de inicio”.
          </p>
        </div>

        <div
          class="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-medium">Notificaciones</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Se comparan contra el último Top 3 visto.
              </p>
            </div>
            <UButton
              size="xs"
              :color="preferences.enabled ? 'error' : 'primary'"
              variant="soft"
              :disabled="!supportsNotifications || permission === 'denied'"
              @click.stop="handleEnableClick"
            >
              {{ preferences.enabled ? "Pausar" : "Activar" }}
            </UButton>
          </div>

          <div
            v-if="permission === 'denied'"
            class="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200"
          >
            El navegador bloqueó las notificaciones. Habilitalas desde los
            permisos del sitio.
          </div>

          <label class="block space-y-1">
            <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Avisar cuando cambie
            </span>
            <select
              class="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              :value="preferences.notifyOn"
              @change="handleModeChange"
            >
              <option
                v-for="mode in notifyModes"
                :key="mode.value"
                :value="mode.value"
              >
                {{ mode.label }}
              </option>
            </select>
          </label>

          <div class="space-y-2">
            <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Monedas
            </p>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="currency in currencies"
                :key="currency.value"
                class="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800"
              >
                <input
                  type="checkbox"
                  class="size-3.5 accent-teal-500"
                  :checked="enabledCurrencies.has(currency.value)"
                  @change="toggleCurrency(currency.value)"
                />
                <UIcon :name="currency.icon" class="size-4" />
                <span>{{ currency.label }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 pt-1">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">
              SW: {{ serviceWorkerReady ? "listo" : "registrando…" }}
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              :loading="isChecking"
              :disabled="!preferences.enabled || permission !== 'granted'"
              @click.stop="checkNow()"
            >
              Probar ahora
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
