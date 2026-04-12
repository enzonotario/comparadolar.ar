<script setup lang="ts">
interface Props {
  providers: Array<{ value: string; label: string }>;
  selectedProviders: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:selectedProviders": [value: string[]];
}>();

const toggleProvider = (providerSlug: string) => {
  const current = [...props.selectedProviders];
  const index = current.indexOf(providerSlug);

  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(providerSlug);
  }

  emit("update:selectedProviders", current);
};

const allSelected = computed(() => {
  return (
    props.providers.length > 0 &&
    props.providers.every((p) => props.selectedProviders.includes(p.value))
  );
});

const toggleAll = () => {
  if (allSelected.value) {
    emit("update:selectedProviders", []);
  } else {
    emit(
      "update:selectedProviders",
      props.providers.map((p) => p.value),
    );
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Proveedores:
      </span>
      <UButton
        :variant="allSelected ? 'solid' : 'outline'"
        color="neutral"
        size="xs"
        @click="toggleAll"
      >
        {{ allSelected ? "Deseleccionar todos" : "Seleccionar todos" }}
      </UButton>
      <UButton
        v-for="provider in providers"
        :key="provider.value"
        :variant="
          selectedProviders.includes(provider.value) ? 'solid' : 'outline'
        "
        color="neutral"
        size="xs"
        @click="toggleProvider(provider.value)"
      >
        {{ provider.label }}
      </UButton>
    </div>
  </div>
</template>
