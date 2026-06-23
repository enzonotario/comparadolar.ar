<script setup lang="ts">
const { showOnly24x7 } = use24x7Filter();
</script>

<template>
  <div class="sticky bottom-4 z-10 flex justify-center pointer-events-none">
    <div>
      <USwitch
        id="only-24x7-switch"
        v-model="showOnly24x7"
        label="Solo proveedores 24/7"
        size="sm"
        :ui="{
          root: 'pointer-events-auto bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center px-4',
          label: 'py-2',
        }"
      />
    </div>
  </div>
</template>
