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

interface PlaylistEntry {
  bannerId: number;
  duration: number;
}

interface Props {
  bannerId?: number;
}

const props = defineProps<Props>();
const { trackSponsorClick } = useAnalytics();

const BASE_URL = "https://api.argentinadatos.com/static/assets/arq/";

const LINK_URL = "https://www.arqfinance.com/?ref=comparadolar.ar";

const defaultBanners: Banner[] = [
  {
    id: 10,
    desktopUrl: `${BASE_URL}Desktop_banner_10.png`,
    mobileUrl: `${BASE_URL}Mobile_banner_10.png`,
    altText: "Banner 10",
    linkUrl: LINK_URL,
  },
  {
    id: 20,
    desktopUrl: `${BASE_URL}Desktop_banner_20.png`,
    mobileUrl: `${BASE_URL}Mobile_banner_20.png`,
    altText: "Banner 20",
    linkUrl: LINK_URL,
  },
  {
    id: 30,
    desktopUrl: `${BASE_URL}Desktop_banner_30.png`,
    mobileUrl: `${BASE_URL}Mobile_banner_30.png`,
    altText: "Banner 30",
    linkUrl: LINK_URL,
  },
  {
    id: 40,
    desktopUrl: `${BASE_URL}Desktop_banner_40.png`,
    mobileUrl: `${BASE_URL}Mobile_banner_40.png`,
    altText: "Banner 40",
    linkUrl: LINK_URL,
  },
];

const playlist: PlaylistEntry[] = [
  { bannerId: 10, duration: 5000 },
  { bannerId: 20, duration: 5000 },
  { bannerId: 30, duration: 5000 },
  { bannerId: 40, duration: 3000 },
];

const imageError = ref(false);
const currentPlaylistIndex = ref(0);
const prefersDark = ref(false);
let timeoutId: ReturnType<typeof setTimeout> | undefined;
let darkModeQuery: MediaQueryList | undefined;

const handleDarkModeChange = (e: MediaQueryListEvent) => {
  prefersDark.value = e.matches;
};

const scheduleNext = () => {
  const entry = playlist[currentPlaylistIndex.value];
  timeoutId = setTimeout(() => {
    currentPlaylistIndex.value =
      (currentPlaylistIndex.value + 1) % playlist.length;
    scheduleNext();
  }, entry.duration);
};

const currentBanner = computed(() => {
  if (imageError.value) return null;

  if (props.bannerId !== undefined) {
    return defaultBanners.find((b) => b.id === props.bannerId) || null;
  }

  const entry = playlist[currentPlaylistIndex.value];
  return defaultBanners.find((b) => b.id === entry.bannerId) || null;
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

  if (props.bannerId === undefined) {
    scheduleNext();
  }
});

onUnmounted(() => {
  darkModeQuery?.removeEventListener("change", handleDarkModeChange);
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
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
          width="1280"
          height="480"
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
        width="1280"
        height="480"
        class="w-full h-auto object-cover duration-300"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
    </picture>
  </div>
</template>
