<script setup lang="ts">
import { RATE_DISPLAY } from "~/lib/rate-labels";
import { formatRemesaRating } from "~/lib/remesas";
import { defineOgImageWithContext } from "~/utils/reactive-og-image";
import { ogUpdatedAtDate } from "~/utils/og-data";

const nuxtApp = useNuxtApp();

useStaticPage({
  title: "Remesas | ComparaDólar",
  description:
    "Compará plataformas para cobrar remesas y pagos del exterior: costos, tarjeta y el precio de venta del dólar en vivo.",
});

const { rows, loading, remesasError, quotesError, formattedUpdatedAt } =
  await useRemesasRows();

const ogItems = computed(() =>
  rows.value.slice(0, 3).map((item) => ({
    name: item.displayName,
    currency: item.monedaLabel,
    rating: formatRemesaRating(item.averageRating),
    receiveCost: item.costoRecibirPagos ?? "N/A",
    arsWithdrawal: item.retiroArs ?? "N/A",
    vendesA: item.vendesALabel,
  })),
);

defineOgImageWithContext(nuxtApp, "Remesas.takumi", {
  title: "Remesas",
  subtitle:
    "Top plataformas para cobrar del exterior, con el precio de venta en vivo.",
  items: ogItems.value,
  updatedAt: formattedUpdatedAt.value || ogUpdatedAtDate(),
});
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-6 text-center">
      <h1 class="text-5xl font-bold md:text-7xl">Remesas</h1>
      <p
        class="mx-auto max-w-2xl text-lg text-zinc-600 md:text-xl dark:text-white/60"
      >
        Compará plataformas para cobrar del exterior: cuenta propia, moneda,
        costos, tarjeta y el
        <span
          class="font-medium"
          :class="[RATE_DISPLAY.bid.textClass, RATE_DISPLAY.bid.darkTextClass]"
        >
          precio de venta
        </span>
        del dólar en vivo.
      </p>
    </header>

    <SponsorBanner />

    <UAlert
      v-if="remesasError"
      color="error"
      variant="soft"
      title="No se pudieron cargar las remesas"
      description="Probá recargar en unos minutos."
    />

    <UAlert
      v-if="quotesError"
      color="warning"
      variant="soft"
      title="No se pudieron cargar los precios de venta"
      description="La tabla sigue mostrando remesas, pero el precio de venta puede quedar incompleto."
    />

    <div
      v-if="loading && rows.length === 0"
      class="py-10 text-center text-muted"
    >
      Cargando remesas…
    </div>

    <RemesasTable v-else :rows="rows" />
  </div>
</template>
