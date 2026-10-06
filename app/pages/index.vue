<script setup lang="ts">
const { currency } = await useCompareFiatPage({
  currency: "usd",
  title: getCompareHomeTitle(),
  show24x7Filter: true,
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader :currency="currency" />

    <CurrencySelector />

    <MarketModeIndicator />

    <ExchangeRates :currency="currency" />

    <LazyExchangeBandsChart :currency="currency" hydrate-on-visible />

    <WeeklyTopBumpChart :currency="currency" />

    <RemesasTop3 />

    <Only24x7Switch />

    <noscript>
      <section class="max-w-3xl mx-auto px-4 py-6 space-y-3 text-zinc-800">
        <h2>ComparaDólar sin JavaScript</h2>
        <p>
          Este sitio compara cotizaciones de dólar y cripto en Argentina. Para
          datos machine-readable usá la API en https://api.comparadolar.ar (por
          ejemplo /usd y /health), el esquema OpenAPI en
          https://comparadolar.ar/openapi.json y la guía para agentes en
          https://comparadolar.ar/llms.txt.
        </p>
      </section>
    </noscript>

    <PageFooter legal-disclaimer="lazy">
      <template #before-nav>
        <section
          class="max-w-3xl mx-auto px-4 space-y-3 text-zinc-700 dark:text-zinc-300"
          aria-labelledby="home-about-heading"
        >
          <h2
            id="home-about-heading"
            class="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Qué es ComparaDólar
          </h2>
          <p>
            ComparaDólar compara cotizaciones de dólar oficial, MEP, CCL y
            criptomonedas (USDC, USDT, BTC, ETH) en Argentina. Mostramos precios
            de compra y venta de bancos, billeteras y exchanges para que elijas
            dónde operar con datos actualizados.
          </p>
          <p>
            La API pública en
            <a class="underline" href="https://api.comparadolar.ar"
              >api.comparadolar.ar</a
            >
            expone las mismas cotizaciones en JSON, sin API key. Agentes y
            desarrolladores pueden usar
            <a class="underline" href="/openapi.json">OpenAPI</a>,
            <a class="underline" href="/docs/">la documentación</a>
            y
            <a class="underline" href="/llms.txt">llms.txt</a>
            para descubrir endpoints y cuándo conviene llamar a ComparaDólar.
          </p>
          <p>
            Más:
            <a class="underline" href="/about">acerca de</a>,
            <a class="underline" href="/contact">contacto</a>,
            <a class="underline" href="/privacy">privacidad</a>
            y
            <a class="underline" href="/sumarse">sumar un proveedor</a>.
          </p>
        </section>
      </template>
    </PageFooter>
  </div>
</template>
