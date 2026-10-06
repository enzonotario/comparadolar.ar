<script setup lang="ts">
useStaticPage({
  title: "Acerca de ComparaDólar",
  description:
    "ComparaDólar compara cotizaciones de dólar y criptomonedas en Argentina. API pública, sin login, para personas y agentes.",
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 px-4 py-8">
    <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost" color="neutral">
      Volver
    </UButton>

    <article class="prose prose-zinc dark:prose-invert max-w-none space-y-4">
      <h1 class="text-4xl font-bold">Acerca de ComparaDólar</h1>
      <p>
        ComparaDólar (comparadolar.ar) es una plataforma argentina para comparar
        cotizaciones de dólar oficial, MEP, CCL y criptomonedas como USDC, USDT,
        BTC y ETH. Reunimos precios de compra y venta de bancos, billeteras y
        exchanges en una sola tabla para que puedas decidir dónde operar con
        menos fricción.
      </p>
      <p>
        El producto es gratuito para consultar. También publicamos una API JSON
        abierta en
        <a href="https://api.comparadolar.ar">api.comparadolar.ar</a>
        con especificación OpenAPI en
        <a href="/openapi.json">/openapi.json</a>
        y documentación en
        <a href="/docs/">/docs/</a>.
        No hace falta API key para los endpoints públicos de lectura.
      </p>
      <p>
        Si desarrollás un agente o una integración, empezá por
        <a href="/llms.txt">/llms.txt</a>
        para saber cuándo usar ComparaDólar y qué recursos llamar. Para sumar tu
        proveedor al listado, visitá
        <a href="/sumarse">/sumarse</a>.
      </p>
      <p>
        Contacto:
        <a href="/contact">/contact</a>
        · Privacidad:
        <a href="/privacy">/privacy</a>
        · Mapa del sitio:
        <a href="/sitemap.xml">/sitemap.xml</a>.
      </p>
    </article>
  </div>
</template>
