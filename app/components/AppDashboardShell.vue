<script setup lang="ts">
/**
 * Misma provisión de contexto que `UDashboardGroup`, sin `fixed inset-0 overflow-hidden`
 * del tema dashboard (bloqueaba el scroll del sitio público).
 */
import { ref } from "vue";
import { provideDashboardContext } from "@nuxt/ui/utils/dashboard";

const nuxtApp = useNuxtApp();

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

provideDashboardContext({
  storage: "cookie",
  storageKey: "dashboard",
  persistent: true,
  unit: "%",
  sidebarOpen,
  toggleSidebar: () => {
    nuxtApp.hooks.callHook("dashboard:sidebar:toggle");
  },
  sidebarCollapsed,
  collapseSidebar: (collapsed: boolean) => {
    nuxtApp.hooks.callHook("dashboard:sidebar:collapse", collapsed);
  },
  toggleSearch: () => {
    nuxtApp.hooks.callHook("dashboard:search:toggle");
  },
});
</script>

<template>
  <div class="relative flex min-h-dvh w-full flex-col">
    <slot />
  </div>
</template>
