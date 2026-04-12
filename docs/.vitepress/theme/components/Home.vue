<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
import Ads from "./Ads.vue";
import SponsorsAvatars from "./sponsors/SponsorsAvatars.vue";

const { site } = useData();

/** Ruta bajo `site.base` (p. ej. /docs/introduction). */
const path = (relative) => {
  const base = site.value.base || "/";
  const p = relative.replace(/^\//, "");
  return base.endsWith("/") ? `${base}${p}` : `${base}/${p}`;
};
</script>

<template>
  <div class="home-simple mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <section class="mb-10 text-center flex flex-col items-center gap-4">
      <h2
        class="mb-4 flex items-center gap-2 !border-t-0 pt-0 text-xl font-semibold"
      >
        <span aria-hidden="true" class="text-rose-500">❤</span>
        Sponsors
      </h2>
      <SponsorsAvatars :size="52" />
    </section>

    <section class="banner-wrapper">
      <Ads />
    </section>
  </div>
</template>
