<script setup lang="ts">
useStaticPage({
  title: "OG — Brand",
  description: "Vista técnica para generar imagen OG de marca.",
  robots: "noindex, nofollow",
});

defineOgImage("Brand", {
  title: "ComparaDolar",
  accentColor: "#10b981",
});
</script>

<template>
  <div
    class="fixed h-px w-px overflow-hidden p-0 -m-px border-0"
    aria-hidden="true"
  >
    Vista solo para generar imagen OG.
  </div>
</template>
