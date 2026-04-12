<script setup>
import DefaultTheme from "vitepress/theme";
import Ads from "./components/Ads.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-footer-before>
      <Ads />
    </template>
  </Layout>
</template>
