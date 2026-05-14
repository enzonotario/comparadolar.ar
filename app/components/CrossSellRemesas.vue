<template>
  <UCard>
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <p class="text-sm font-semibold">
          ¿Cobrás del exterior?
        </p>
        <p class="text-sm text-muted">
          Mirá la comparativa de remesas en
          <NuxtLink
            to="https://comparatasas.ar/remesas"
            external
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 hover:underline"
          >
            comparatasas.ar/remesas
          </NuxtLink>.
        </p>
      </div>

      <UButton
        to="https://comparatasas.ar/remesas"
        external
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-arrow-up-right"
      >
        Ver remesas
      </UButton>
    </div>
  </UCard>
</template>
