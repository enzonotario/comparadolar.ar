<script setup lang="ts">
interface Props {
  showLogo?: boolean;
  crossSell?: boolean;
  legalDisclaimer?: "lazy" | "eager";
}

withDefaults(defineProps<Props>(), {
  showLogo: true,
  crossSell: false,
});
</script>

<template>
  <footer class="w-full flex flex-col gap-8">
    <CrossSellRemesas v-if="crossSell" />

    <slot name="before-nav" />

    <div>
      <img
        v-if="showLogo"
        src="/assets/logo.png"
        alt="ComparaDólar"
        class="w-full max-w-[10rem] mx-auto"
      />

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
