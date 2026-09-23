<script setup lang="ts">
import type { CurrencyType } from "~/lib/types";
import { validCurrencies, currenciesConfig } from "~/lib/currencies-config";
import { toApiCurrency } from "~/lib/market-constants";
import {
  ensureProvidersCatalogsLoaded,
  filterProvidersCatalogForCurrency,
  getProviderEntityPath,
  useProvidersCatalogRegistry,
} from "~/composables/useProvidersCatalog";

const route = useRoute();

const showPalette = computed(() => route.path !== "/sumarse");

const catalogs = useProvidersCatalogRegistry();

/** Tokens extra para Fuse (marca anterior, etc.). Clave = slug en minúsculas. */
const PROVIDER_SEARCH_ALIASES: Record<string, string> = {
  arq: "DolarApp",
  nexo: "Buenbit",
  "fiwind-cripto": "fiwind",
  "fiwind-mep": "fiwind",
  "brubank-ultra": "brubank",
};

/** Páginas estáticas del sitio (mapa del sitio / navegación adicional). */
const SITE_PAGES = [
  {
    id: "inicio",
    label: "Inicio",
    description: "home / comparar cotizaciones",
    to: "/",
    icon: "i-heroicons-home",
  },
  {
    id: "graficos",
    label: "Gráficos",
    description: "charts / histórico",
    to: "/graficos",
    icon: "i-heroicons-chart-bar",
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "vista densa / tabla",
    to: "/terminal",
    icon: "i-heroicons-computer-desktop",
  },
  {
    id: "remesas",
    label: "Remesas",
    description: "cobrar del exterior / envíos",
    to: "/remesas",
    icon: "i-heroicons-banknotes",
  },
  {
    id: "sumarse",
    label: "Sumarse",
    description: "integrar / API / listado gratuito",
    to: "/sumarse",
    icon: "i-heroicons-plus-circle",
  },
] as const;

const open = ref(false);
const bootstrapping = ref(false);

watch(open, async (isOpen) => {
  if (!isOpen) return;
  bootstrapping.value = true;
  try {
    await ensureProvidersCatalogsLoaded(catalogs);
  } finally {
    bootstrapping.value = false;
  }
});

const paletteGroups = computed(() => {
  type Item = {
    id: string;
    label: string;
    suffix?: string;
    description: string;
    to: string;
    icon?: string;
    avatar?: { src: string };
  };

  const groups: { id: string; label: string; items: Item[] }[] = [
    {
      id: "pages",
      label: "Páginas",
      items: SITE_PAGES.map((page) => ({
        id: `page-${page.id}`,
        label: page.label,
        suffix: "Página",
        description: page.description,
        to: page.to,
        icon: page.icon,
      })),
    },
  ];

  for (const currency of validCurrencies) {
    const c = currency as CurrencyType;
    const api = toApiCurrency(c);
    const raw = catalogs[api].data.value;
    if (!raw?.length) continue;

    const filtered = filterProvidersCatalogForCurrency(raw, c);
    if (!filtered.length) continue;

    const cfg = currenciesConfig[c];

    groups.push({
      id: `providers-${c}`,
      label: `${cfg.fullName} (${cfg.label})`,
      items: filtered.map((p) => {
        const slugKey = (p.slug || "").toLowerCase();
        const alias = PROVIDER_SEARCH_ALIASES[slugKey];
        return {
          id: `${c}-${p.slug}`,
          label: p.prettyName || p.name,
          suffix: cfg.label,
          description: [p.slug, alias].filter(Boolean).join(" / "),
          to: getProviderEntityPath(c, p.slug),
          avatar: p.logoUrl ? { src: p.logoUrl } : undefined,
        };
      }),
    });
  }

  return groups;
});

const providerItemCount = computed(() =>
  paletteGroups.value.reduce((n, g) => n + g.items.length, 0),
);
</script>

<template>
  <UDashboardSearch
    v-if="showPalette"
    v-model:open="open"
    :groups="paletteGroups"
    :loading="bootstrapping"
    :fuse="{
      fuseOptions: {
        keys: ['label', 'suffix', 'description'],
        threshold: 0.22,
        ignoreLocation: true,
      },
      resultLimit: 128,
    }"
    :color-mode="false"
    placeholder="Buscar proveedor o página…"
    :virtualize="providerItemCount > 48"
  />
</template>
