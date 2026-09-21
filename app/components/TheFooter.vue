<script setup lang="ts">
import type { FooterColumn } from "@nuxt/ui";
import { getFaviconUrl } from "@/lib/favicon-config";
import { SITE_CONFIG } from "@/lib/types";

const year = new Date().getFullYear();

const { isInstalled, updateAvailable } = usePwaInstall();

/** Promo PWA solo si aporta: instalar/guía, o hay actualización. */
const showPwaPromo = computed(
  () => updateAvailable.value || !isInstalled.value,
);

const columns: FooterColumn[] = [
  {
    label: "Herramientas",
    children: [
      { label: "Comparar", to: "/" },
      { label: "Terminal", to: "/terminal" },
      { label: "Gráficos", to: "/graficos" },
      { label: "Remesas", to: "/remesas" },
    ],
  },
  {
    label: "Proyecto",
    children: [
      { label: "Sumarse", to: "/sumarse" },
      {
        label: "API Docs",
        to: "https://comparadolar.ar/docs/",
        target: "_blank",
      },
      {
        label: "Código en GitHub",
        to: "https://github.com/enzonotario/comparadolar.ar",
        target: "_blank",
      },
      {
        label: "Apoyar el proyecto",
        to: "https://cafecito.app/enzonotario",
        target: "_blank",
      },
    ],
  },
];

/** Enlaces de comunidad: nofollow para no parecer link farm. */
const friendlyPages = [
  { label: "comparatasas.ar", to: "https://comparatasas.ar" },
  { label: "comparapix.ar", to: "https://comparapix.ar" },
  { label: "comparatiendas.com.ar", to: "https://www.comparatiendas.com.ar/" },
  { label: "icons.com.ar", to: "https://icons.com.ar" },
  { label: "dolarya.info", to: "https://dub.link/asxwg8M" },
  { label: "argentinadatos.com", to: "https://dub.link/l58DNjJ" },
  { label: "dolarito.ar", to: "https://dub.link/cCOI35S" },
  { label: "impuestito.org", to: "https://dub.link/dh8pB0R" },
  { label: "enqueinvierto.ar", to: "https://enqueinvierto.ar" },
  { label: "betece.app", to: "https://betece.app" },
] as const;

const socialLinks = [
  {
    label: "GitHub",
    to: "https://github.com/enzonotario/comparadolar.ar",
    icon: "i-lucide-github",
  },
  {
    label: "X (Twitter)",
    to: "https://twitter.com/enzonotario_",
    icon: "i-lucide-x",
  },
  {
    label: "Cafecito",
    to: "https://cafecito.app/enzonotario",
    icon: "i-lucide-coffee",
  },
] as const;
</script>

<template>
  <div>
    <USeparator type="dashed" class="h-px mt-6" />

    <UFooter
      :ui="{
        top: 'py-6 lg:py-8',
        bottom: 'border-t border-default py-3 lg:py-4',
        container: 'max-w-7xl mx-auto',
      }"
    >
      <template #top>
        <UContainer class="max-w-7xl mx-auto">
          <UFooterColumns
            :columns="columns"
            :ui="{
              root: 'xl:grid-cols-3 xl:gap-10',
              left: 'mb-8 xl:mb-0',
              center: 'grid grid-cols-2 gap-6 sm:gap-8 xl:col-span-2',
              label: 'text-sm font-semibold text-highlighted',
              list: 'mt-3 space-y-2',
              link: 'text-sm text-muted hover:text-default',
            }"
          >
            <template #left>
              <div class="space-y-4 max-w-sm">
                <NuxtLink
                  to="/"
                  class="inline-flex items-center gap-2 group"
                  :aria-label="SITE_CONFIG.name"
                >
                  <img
                    :src="getFaviconUrl()"
                    alt=""
                    width="32"
                    height="32"
                    class="size-8 rounded-full"
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    class="text-lg font-bold text-highlighted group-hover:text-primary transition-colors"
                  >
                    {{ SITE_CONFIG.domain }}
                  </span>
                </NuxtLink>

                <p class="text-sm text-muted leading-relaxed">
                  Compará cotizaciones de dólar y otras monedas en Argentina, en
                  tiempo real y sin registro.
                </p>

                <div class="flex flex-col items-start gap-2">
                  <UButton
                    to="https://cafecito.app/enzonotario"
                    external
                    target="_blank"
                    rel="noopener noreferrer"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-heart"
                  >
                    Invitame un café
                  </UButton>

                  <ClientOnly>
                    <PwaFooterButton v-if="showPwaPromo" size="sm" />
                  </ClientOnly>
                </div>
              </div>
            </template>
          </UFooterColumns>

          <nav
            class="mt-6 pt-5 border-t border-default"
            aria-label="Páginas amigas"
          >
            <p class="text-xs font-medium text-muted mb-2">Páginas amigas</p>
            <ul class="flex flex-wrap gap-x-3 gap-y-1">
              <li v-for="page in friendlyPages" :key="page.label">
                <a
                  :href="page.to"
                  class="inline-block py-1 text-xs text-muted hover:text-default hover:underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {{ page.label }}
                </a>
              </li>
            </ul>
          </nav>
        </UContainer>
      </template>

      <template #left>
        <p class="text-xs text-muted text-center lg:text-left">
          © {{ year }} {{ SITE_CONFIG.name }}
        </p>
      </template>

      <p
        class="text-xs text-muted/80 text-center max-w-md leading-snug order-last lg:order-none mt-2 lg:mt-0"
      >
        Datos referenciales con fines informativos. No constituye asesoramiento
        financiero.
      </p>

      <template #right>
        <div class="flex items-center justify-center lg:justify-end gap-0.5">
          <UButton
            v-for="link in socialLinks"
            :key="link.label"
            :to="link.to"
            :icon="link.icon"
            :aria-label="link.label"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </template>
    </UFooter>
  </div>
</template>
