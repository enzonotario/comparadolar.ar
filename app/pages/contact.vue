<script setup lang="ts">
useStaticPage({
  title: "Contacto — ComparaDólar",
  description:
    "Contactá al equipo de ComparaDólar por email para API, integraciones de proveedores y consultas generales.",
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 px-4 py-8">
    <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost" color="neutral">
      Volver
    </UButton>

    <article class="prose prose-zinc dark:prose-invert max-w-none space-y-4">
      <h1 class="text-4xl font-bold">Contacto</h1>
      <p>
        Escribinos a
        <a href="mailto:hi@enzonotario.me">hi@enzonotario.me</a>
        para consultas sobre ComparaDólar, la API pública, correcciones de
        cotizaciones, sponsorships o para integrar tu servicio en el listado.
      </p>
      <p>
        Para integraciones técnicas de proveedores, también podés seguir la guía
        en
        <a href="/sumarse">/sumarse</a>.
        La documentación de la API está en
        <a href="/docs/">/docs/</a>
        y el esquema OpenAPI en
        <a href="/openapi.json">/openapi.json</a>.
      </p>
      <p>
        Base de la API:
        <a href="https://api.comparadolar.ar">https://api.comparadolar.ar</a>.
        Health check:
        <a href="https://api.comparadolar.ar/health"
          >https://api.comparadolar.ar/health</a
        >. Recursos para agentes:
        <a href="/llms.txt">/llms.txt</a>.
      </p>
      <p>
        Acerca de nosotros:
        <a href="/about">/about</a>
        · Privacidad:
        <a href="/privacy">/privacy</a>
        · Sitio:
        <a href="https://comparadolar.ar">comparadolar.ar</a>.
      </p>
    </article>
  </div>
</template>
