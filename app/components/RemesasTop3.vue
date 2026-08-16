<script setup lang="ts">
import { RATE_DISPLAY } from "~/lib/rate-labels";

const { top3: rows, loading } = await useRemesasRows();
</script>

<template>
  <UCard class="bg-green-50/60 dark:bg-green-950/20">
    <template #header>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Remesas: top plataformas</h2>
        <p class="text-sm text-muted">
          Compará costos para cobrar del exterior y el
          <span
            class="font-medium"
            :class="[
              RATE_DISPLAY.bid.textClass,
              RATE_DISPLAY.bid.darkTextClass,
            ]"
          >
            precio de venta
          </span>
          del dólar en vivo.
        </p>
      </div>
    </template>

    <div v-if="loading && rows.length === 0" class="py-6 text-sm text-muted">
      Cargando remesas…
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr
            class="border-b border-default text-xs uppercase tracking-wide text-muted"
          >
            <th class="pb-3 pr-3 font-semibold">#</th>
            <th class="pb-3 pr-3 font-semibold">Plataforma</th>
            <th class="pb-3 pr-3 font-semibold">Retiro ARS</th>
            <th class="pb-3 pr-3 font-semibold">
              {{ RATE_DISPLAY.bid.label }}
            </th>
            <th class="pb-3 font-semibold">Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="row.compania"
            class="border-b border-default/70 last:border-0"
          >
            <td class="py-3 pr-3 font-semibold text-muted">{{ index + 1 }}</td>
            <td class="py-3 pr-3">
              <div class="flex items-center gap-2.5">
                <img
                  v-if="row.logo"
                  :src="row.logo"
                  :alt="`${row.displayName} logo`"
                  class="size-8 rounded-full object-contain"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex size-8 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold dark:bg-neutral-800"
                >
                  {{ row.initials }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate">{{ row.displayName }}</p>
                </div>
              </div>
            </td>
            <td class="py-3 pr-3">
              <UBadge
                :color="row.zeroArsWithdrawal ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ row.retiroArs ?? "N/A" }}
              </UBadge>
            </td>
            <td class="py-3 pr-3">
              <NuxtLink
                v-if="row.vendesA != null && row.vendesAPath"
                :to="row.vendesAPath"
                class="font-mono font-semibold hover:underline"
                :class="[
                  RATE_DISPLAY.bid.textClass,
                  RATE_DISPLAY.bid.darkTextClass,
                ]"
              >
                {{ row.vendesALabel }}
              </NuxtLink>
              <span v-else class="text-muted">{{ row.vendesALabel }}</span>
            </td>
            <td class="py-3 font-medium">{{ row.averageRatingLabel }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-muted">
          Mirá la tabla completa con cuenta propia, tarjeta, costos y filtros.
        </p>
        <UButton
          to="/remesas"
          color="neutral"
          icon="i-lucide-arrow-right"
          trailing
        >
          Remesas
        </UButton>
      </div>
    </template>
  </UCard>
</template>
