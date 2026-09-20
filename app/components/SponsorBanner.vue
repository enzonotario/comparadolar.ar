<script setup lang="ts">
import { useAnalytics } from "~/composables/useAnalytics";

interface Banner {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
  desktopDarkUrl?: string;
  mobileDarkUrl?: string;
  altText: string;
  linkUrl?: string;
}

interface Props {
  bannerId?: number;
}

const props = defineProps<Props>();
const { trackSponsorClick } = useAnalytics();

const BASE_URL = "https://api.argentinadatos.com/static/assets/arq/";

const LINK_URL =
  "https://www.arqfinance.com/referrals/arr?referralCode=enzonotario_sJx&pid=referral&c=arr&is_retargeting=true";

const banner: Banner = {
  id: 1,
  desktopUrl: `${BASE_URL}comparadolar-desktop.gif`,
  mobileUrl: `${BASE_URL}comparadolar-mobile.gif`,
  altText: "ARQ — Datos de cuenta en Estados Unidos",
  linkUrl: LINK_URL,
};

const imageError = ref(false);
const prefersDark = ref(false);
let darkModeQuery: MediaQueryList | undefined;

const handleDarkModeChange = (e: MediaQueryListEvent) => {
  prefersDark.value = e.matches;
};

const currentBanner = computed(() => {
  if (imageError.value) return null;
  if (props.bannerId !== undefined && props.bannerId !== banner.id) return null;
  return banner;
});

const mobileSrc = computed(() => {
  if (!currentBanner.value) return "";
  return prefersDark.value && currentBanner.value.mobileDarkUrl
    ? currentBanner.value.mobileDarkUrl
    : currentBanner.value.mobileUrl;
});

const desktopSrc = computed(() => {
  if (!currentBanner.value) return "";
  return prefersDark.value && currentBanner.value.desktopDarkUrl
    ? currentBanner.value.desktopDarkUrl
    : currentBanner.value.desktopUrl;
});

onMounted(() => {
  darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  prefersDark.value = darkModeQuery.matches;
  darkModeQuery.addEventListener("change", handleDarkModeChange);
});

onUnmounted(() => {
  darkModeQuery?.removeEventListener("change", handleDarkModeChange);
});

const handleImageError = () => {
  imageError.value = true;
  console.warn("Error al cargar banner:", currentBanner.value?.id);
};

const handleSponsorClick = () => {
  if (currentBanner.value) {
    trackSponsorClick({
      sponsorName: currentBanner.value.altText,
      sponsorUrl: currentBanner.value.linkUrl ?? "",
      bannerId: currentBanner.value.id,
    });
  }
};
</script>

<template>
  <div
    v-if="currentBanner"
    class="w-full my-6 overflow-hidden rounded-xl shadow-sm relative group"
  >
    <NuxtLink
      v-if="currentBanner.linkUrl"
      :to="currentBanner.linkUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="block w-full h-full"
      @click="handleSponsorClick"
    >
      <picture>
        <source media="(max-width: 767px)" :srcset="mobileSrc" />
        <img
          :src="desktopSrc"
          :alt="currentBanner.altText"
          width="960"
          height="120"
          class="w-full h-auto object-cover duration-300"
          loading="lazy"
          decoding="async"
          @error="handleImageError"
        />
      </picture>
    </NuxtLink>
    <picture v-else>
      <source media="(max-width: 767px)" :srcset="mobileSrc" />
      <img
        :src="desktopSrc"
        :alt="currentBanner.altText"
        width="960"
        height="120"
        class="w-full h-auto object-cover duration-300"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
    </picture>
  </div>
</template>
