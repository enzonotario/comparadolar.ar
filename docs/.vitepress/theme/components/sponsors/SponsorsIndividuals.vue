<script setup>
import { ref } from 'vue'
import { data } from '../../../data/latestCafecitos.data'
import SponsorCard from './SponsorCard.vue'

const githubSponsors = ref([
  'https://github.com/catdevnull',
  'https://github.com/Xyborg',
])
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SponsorCard v-for="(profile, idx) in githubSponsors" :key="idx" :profile="profile" />
    </div>

    <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <h3 class="text-[var(--vp-c-text-1)]">
          Top Cafecitos
        </h3>
        <div class="flex flex-col gap-2">
          <a
            v-for="(donation, idx) in data.topDonations"
            :key="idx"
            href="https://cafecito.app/enzonotario"
            target="_blank"
            rel="noopener noreferrer"
            class="cafecito-name-link block rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-4 transition-colors !no-underline hover:border-indigo-500 dark:hover:border-indigo-400"
          >
            {{ donation.name }}
          </a>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="text-[var(--vp-c-text-1)]">
          Últimos Cafecitos
        </h3>
        <div class="flex flex-col gap-2">
          <a
            v-for="(donation, idx) in data.latestCoffees"
            :key="idx"
            href="https://cafecito.app/enzonotario"
            target="_blank"
            rel="noopener noreferrer"
            class="cafecito-name-link block rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-4 transition-colors !no-underline hover:border-indigo-500 dark:hover:border-indigo-400"
          >
            {{ donation.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.vp-doc a.cafecito-name-link {
  color: rgb(24 24 27) !important;
}
html.dark .vp-doc a.cafecito-name-link {
  color: rgb(244 244 245) !important;
}
</style>
