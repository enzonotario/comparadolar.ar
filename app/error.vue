<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const statusCode = computed(() => props.error?.statusCode || 500);
const isNotFound = computed(() => statusCode.value === 404);

const event = useRequestEvent();
if (import.meta.server && event) {
  setResponseStatus(event, statusCode.value, props.error.statusMessage);
}

useHead({
  title: isNotFound.value
    ? "Página no encontrada | ComparaDólar"
    : `Error ${statusCode.value} | ComparaDólar`,
});
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-16">
    <div class="max-w-lg w-full space-y-6 text-center">
      <p class="text-6xl font-bold text-zinc-300 dark:text-zinc-600">
        {{ statusCode }}
      </p>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {{ isNotFound ? "Página no encontrada" : "Algo salió mal" }}
      </h1>
      <p class="text-zinc-600 dark:text-zinc-400">
        {{
          isNotFound
            ? "Esa ruta no existe en ComparaDólar. Podés volver al inicio, leer la documentación de la API o el mapa para agentes (llms.txt)."
            : error.statusMessage || error.message || "Error inesperado."
        }}
      </p>
      <div class="flex flex-wrap gap-3 justify-center">
        <a
          href="/"
          class="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-white"
          >Inicio</a
        >
        <a
          href="/docs/"
          class="inline-flex items-center rounded-md border px-4 py-2"
          >Docs API</a
        >
        <a
          href="/llms.txt"
          class="inline-flex items-center rounded-md px-4 py-2 underline"
          >llms.txt</a
        >
      </div>
      <p class="text-sm text-zinc-500">
        OpenAPI:
        <a class="underline" href="/openapi.json">/openapi.json</a>
        · Sitemap:
        <a class="underline" href="/sitemap.xml">/sitemap.xml</a>
        · Contacto:
        <a class="underline" href="/contact">/contact</a>
      </p>
    </div>
  </div>
</template>
