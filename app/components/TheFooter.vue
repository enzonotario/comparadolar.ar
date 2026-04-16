<script setup lang="ts">
const friendlyPages = [
  {
    label: "comparatasas.ar",
    to: "https://comparatasas.ar",
  },
  {
    label: "comparapix.ar",
    to: "https://comparapix.ar",
  },
  {
    label: "icons.com.ar",
    to: "https://icons.com.ar",
  },
  {
    label: "dolarya.info",
    to: "https://dub.link/asxwg8M",
  },
  {
    label: "argentinadatos.com",
    to: "https://dub.link/l58DNjJ",
  },
  {
    label: "dolarito.ar",
    to: "https://dub.link/cCOI35S",
  },
  {
    label: "impuestito.org",
    to: "https://dub.link/dh8pB0R",
  },
  {
    label: "enqueinvierto.ar",
    to: "https://enqueinvierto.ar",
  },
  {
    label: "betece.app",
    to: "https://betece.app",
  },
];
</script>

<template>
  <div>
    <USeparator type="dashed" class="h-px mt-6" />

    <UFooter
      :ui="{
        top: '!py-6',
        container: '!p-0',
      }"
    >
      <template #top>
        <UContainer class="w-full max-w-3xl mx-auto space-y-12 !py-0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
            <div class="flex flex-col items-start gap-2">
              <h3 class="text-xl font-bold">Apoyá el proyecto</h3>
              <p class="text-sm text-muted">
                Ayudame a mantener y mejorar este proyecto con una donación.
              </p>
              <UButton
                to="https://cafecito.app/enzonotario"
                external
                target="_blank"
                rel="noopener noreferrer"
                color="neutral"
                variant="outline"
                size="lg"
              >
                <UIcon name="i-heroicons-heart" />
                Invitame un café
              </UButton>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-bold">Mapa del Sitio</h3>
              <div class="flex flex-col gap-2">
                <NuxtLink
                  to="/"
                  class="text-sm text-zinc-600 dark:text-white/60 hover:underline"
                >
                  Inicio
                </NuxtLink>
                <NuxtLink
                  to="/graficos"
                  class="text-sm text-zinc-600 dark:text-white/60 hover:underline"
                >
                  Gráficos
                </NuxtLink>
                <NuxtLink
                  to="/terminal"
                  class="text-sm text-zinc-600 dark:text-white/60 hover:underline"
                >
                  Terminal
                </NuxtLink>
                <NuxtLink
                  to="/sumarse"
                  class="text-sm text-zinc-600 dark:text-white/60 hover:underline"
                >
                  Sumarse
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-start gap-2">
            <h3 class="text-xl font-bold">Open Source</h3>
            <p class="text-sm text-muted">
              Este proyecto es de código abierto. La API pública también está
              documentada para integraciones.
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                href="https://github.com/enzonotario/comparadolar.ar"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                color="neutral"
                class="space-x-2"
              >
                <UIcon name="i-lucide-github" class="size-4" />
                GitHub
              </UButton>
              <UButton
                href="https://comparadolar.ar/docs/"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                color="neutral"
                class="space-x-2"
              >
                <UIcon name="i-heroicons-document-text" class="size-4" />
                API Docs
              </UButton>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold">Páginas amigas</h3>
            <div class="flex flex-wrap gap-4">
              <a
                v-for="page in friendlyPages"
                :key="page.label"
                :href="page.to"
                class="block text-sm text-zinc-600 dark:text-white/60 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ page.label }}
              </a>
            </div>
          </div>
        </UContainer>
      </template>
    </UFooter>
  </div>
</template>
