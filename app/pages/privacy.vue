<script setup lang="ts">
useStaticPage({
  title: "Privacidad — ComparaDólar",
  description:
    "Política de privacidad de ComparaDólar: cotizaciones públicas, logs técnicos y cómo contactarnos.",
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 px-4 py-8">
    <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost" color="neutral">
      Volver
    </UButton>

    <article class="prose prose-zinc dark:prose-invert max-w-none space-y-4">
      <h1 class="text-4xl font-bold">Privacidad</h1>
      <p>
        ComparaDólar muestra cotizaciones de mercado de acceso público. No
        necesitás crear una cuenta para ver las tablas de dólar o criptomonedas
        ni para consumir la API pública de solo lectura en
        <a href="https://api.comparadolar.ar">api.comparadolar.ar</a>.
      </p>
      <p>
        Podemos usar analítica agregada y registros de servidor estándar (por
        ejemplo dirección IP, user-agent, ruta y horarios) para mantener la
        disponibilidad del sitio, detectar abuso y mejorar el rendimiento. No
        vendemos datos personales. La API responde datos de mercado, no perfiles
        de usuarios finales.
      </p>
      <p>
        Si integrás un proveedor o un cliente HTTP, evitá enviar secretos en
        query strings. El esquema OpenAPI está en
        <a href="/openapi.json">/openapi.json</a>.
        Para ejercer derechos o hacer preguntas de privacidad, escribinos a
        <a href="mailto:hi@enzonotario.me">hi@enzonotario.me</a>
        o usá
        <a href="/contact">/contact</a>.
      </p>
      <p>
        Más información:
        <a href="/about">/about</a>
        · Documentación:
        <a href="/docs/">/docs/</a>
        · Mapa para agentes:
        <a href="/llms.txt">/llms.txt</a>.
      </p>
    </article>
  </div>
</template>
