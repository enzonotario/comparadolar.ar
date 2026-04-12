<script setup lang="ts">
const { navigationItems } = useNavigationItems();
</script>

<template>
  <div class="h-[var(--ui-header-height)] flex flex-wrap gap-2 justify-center">
    <UButton
      v-for="link in navigationItems"
      :key="link.value"
      :variant="link.active ? 'link' : 'ghost'"
      color="neutral"
      size="sm"
      :to="link.to"
      :class="[
        'transition-all duration-200 rounded-none',
        link.active
          ? 'border-b border-neutral text-neutral'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      ]"
    >
      <UIcon :name="link.icon" class="mr-2" />
      {{ link.label }}
    </UButton>
  </div>
</template>
