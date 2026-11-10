<script setup lang="ts">
interface Props {
  showLogo?: boolean;
  remesasTop?: boolean;
  legalDisclaimer?: "lazy" | "eager";
}

withDefaults(defineProps<Props>(), {
  showLogo: true,
  remesasTop: false,
});
</script>

<template>
  <footer class="w-full flex flex-col gap-8">
    <RemesasTop3 v-if="remesasTop" />

    <slot name="before-nav" />

    <div>
      <picture v-if="showLogo">
        <source srcset="/assets/logo.webp" type="image/webp" />
        <img
          src="/assets/logo.png"
          alt="ComparaDólar"
          width="320"
          height="305"
          class="w-full max-w-[10rem] mx-auto"
          loading="lazy"
          decoding="async"
        />
      </picture>

      <LazyLegalDisclaimer v-if="legalDisclaimer === 'lazy'" />
      <LegalDisclaimer v-else-if="legalDisclaimer === 'eager'" />

      <CurrencyNavigation
        :class="{
          'mt-12': legalDisclaimer,
        }"
      />
    </div>

    <slot />
  </footer>
</template>
