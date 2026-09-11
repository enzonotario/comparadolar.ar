<script setup lang="ts">
const { navigationItems } = useNavigationItems();
</script>

<template>
  <div
    class="h-[var(--ui-header-height)] w-max max-w-full min-w-0 flex flex-nowrap items-center gap-2 justify-start overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <UButton
      v-for="link in navigationItems"
      :key="link.value"
      :variant="link.active ? 'link' : 'ghost'"
      color="neutral"
      size="sm"
      :to="link.to"
      :class="[
        'shrink-0 transition-all duration-200 rounded-none',
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
