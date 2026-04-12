<script setup lang="ts">
useSeo({
  title: "Integrar tu servicio - ComparaDolar.ar",
  description:
    "Integrá tu servicio de cotizaciones de dólar en ComparaDolar.ar. Listado gratuito para proveedores de cotizaciones.",
});

useStructuredData({
  type: "WebPage",
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="flex items-center gap-4 mb-8">
      <UButton
        to="/"
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        size="lg"
      >
        Volver
      </UButton>
    </div>

    <div class="space-y-8">
      <div>
        <h1 class="text-4xl font-bold mb-4">Integrar tu servicio</h1>
        <p class="text-lg text-zinc-600 dark:text-zinc-400">
          El listado en ComparaDolar.ar es gratuito. Para integrar tu app o
          servicio de cotizaciones, solo necesitás proveer un endpoint con las
          cotizaciones.
        </p>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold">Requisitos</h2>
        </template>
        <ul
          class="space-y-3 list-disc list-inside text-zinc-700 dark:text-zinc-300"
        >
          <li>Nombre de tu app o servicio</li>
          <li>Endpoint con cotizaciones</li>
          <li>Isologo cuadrado (SVG o PNG)</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold">Especificación del endpoint</h2>
        </template>
        <div class="space-y-4">
          <p class="text-zinc-700 dark:text-zinc-300">
            El formato de respuesta es flexible. Estos son dos ejemplos de
            respuestas válidas:
          </p>

          <div class="space-y-4">
            <div>
              <h3 class="font-semibold mb-2 text-zinc-900 dark:text-white">
                Cotización única
              </h3>
              <div
                class="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto"
              >
                <pre class="text-sm text-zinc-100"><code>{
  "bid": 123.45,
  "ask": 125.67,
  "currency": "usd"
}</code></pre>
              </div>
            </div>

            <div>
              <h3 class="font-semibold mb-2 text-zinc-900 dark:text-white">
                Múltiples cotizaciones
              </h3>
              <div
                class="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto"
              >
                <pre class="text-sm text-zinc-100"><code>{
  "rates": [
    {
      "bid": 123.45,
      "ask": 125.67
      "currency": "usd",
    },
    {
      "bid": 145.67,
      "ask": 147.89,
      "currency": "usdc",
    }
  ]
}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold">Detalles de integración</h2>
        </template>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="font-semibold text-zinc-900 dark:text-white mb-1">
                Frecuencia de polling
              </div>
              <div class="text-zinc-600 dark:text-zinc-400">5 minutos</div>
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-white mb-1">
                Timeout de polling
              </div>
              <div class="text-zinc-600 dark:text-zinc-400">15 segundos</div>
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-white mb-1">
                Autenticación
              </div>
              <div class="text-zinc-600 dark:text-zinc-400">
                Headers custom (opcional)
              </div>
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-white mb-1">
                IPs de origen
              </div>
              <div class="text-zinc-600 dark:text-zinc-400">
                GitHub/CloudFlare IPs
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold">Solicitar integración</h2>
        </template>
        <div class="space-y-4">
          <p class="text-zinc-700 dark:text-zinc-300">
            Enviá un email con el nombre de tu app, la URL del endpoint y un
            logo cuadrado (SVG o PNG).
          </p>
          <UButton
            :to="`mailto:hi@enzonotario.me?subject=Solicitud de integración - ComparaDolar.ar&body=Hola,%0D%0A%0D%0AQuiero integrar mi servicio en ComparaDolar.ar.%0D%0A%0D%0ANombre de la app:%0D%0AEndpoint:%0D%0ALogo: (adjuntar archivo)%0D%0A%0D%0ASaludos`"
            icon="i-heroicons-envelope"
            size="lg"
            color="primary"
          >
            hi@enzonotario.me
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
