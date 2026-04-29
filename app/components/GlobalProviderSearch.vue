<script setup lang="ts">
import type { CurrencyType } from "~/lib/types";
import { validCurrencies, currenciesConfig } from "~/lib/currencies-config";
import {
  ensureProvidersCatalogsLoaded,
  filterProvidersCatalogForCurrency,
  getProviderEntityPath,
  useProvidersCatalogRegistry,
} from "~/composables/useProvidersCatalog";

const route = useRoute();

const showPalette = computed(() => route.path !== "/sumarse");

const catalogs = useProvidersCatalogRegistry();

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
    suffix: string;
    description: string;
    to: string;
    avatar?: { src: string };
  };

  const groups: { id: string; label: string; items: Item[] }[] = [];

  for (const currency of validCurrencies) {
    const c = currency as CurrencyType;
    const api = c === "usd-ccl" ? "usd" : c;
    const raw = catalogs[api].data.value;
    if (!raw?.length) continue;

    const filtered = filterProvidersCatalogForCurrency(raw, c);
    if (!filtered.length) continue;

    const cfg = currenciesConfig[c];

    groups.push({
      id: `providers-${c}`,
      label: `${cfg.fullName} (${cfg.label})`,
      items: filtered.map((p) => ({
        id: `${c}-${p.slug}`,
        label: p.prettyName || p.name,
        suffix: cfg.label,
        description: p.slug,
        to: getProviderEntityPath(c, p.slug),
        avatar: p.logoUrl ? { src: p.logoUrl } : undefined,
      })),
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
    placeholder="Buscar proveedor…"
    :virtualize="providerItemCount > 48"
  />
</template>
