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
    <NuxtImg
      src="/assets/logo.png"
      alt="Logo de ComparaDolar.ar"
      width="160"
      height="160"
      class="mx-auto"
    />
    <UFooter class="border-t border-zinc-200 dark:border-zinc-700">
      <template #top>
        <UContainer class="!py-0">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
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
          </div>
        </UContainer>
      </template>
    </UFooter>
  </div>
</template>
