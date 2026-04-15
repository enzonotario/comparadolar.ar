import { SITE_CONFIG } from "./app/lib/types";
import { currenciesConfig } from "./app/lib/currencies-config";
import { getSitemapUrls } from "./app/lib/sitemap-config";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  routeRules: {
    "/usdc/dolarapp": { redirect: "/usdc/arq" },
  },

  ssr: true,
  nitro: {
    preset: "cloudflare-pages",
    compressPublicAssets: true,
    minify: true,
  },

  appDir: "app",

  modules: [
    "@nuxt/ui",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@nuxt/eslint",
    "nuxt-gtag",
    "nuxt-echarts",
    "nuxt-og-image",
  ],

  experimental: {
    payloadExtraction: false,
  },

  vite: {
    build: {
      cssCodeSplit: true,
      cssMinify: true,
      minify: "esbuild",
    },
    optimizeDeps: {
      include: ["echarts", "vue-echarts"],
    },
  },

  sitemap: {
    hostname: SITE_CONFIG.baseUrl,
    urls: getSitemapUrls,
    zeroRuntime: true,
  },

  ui: {
    global: true,
    icons: ["heroicons", "lucide"],
  },

  colorMode: {
    preference: "system",
    fallback: "light",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storageKey: "nuxt-color-mode",
  },

  css: ["@/assets/css/main.css"],

  image: {
    domains: ["v0.blob.com", "ik.imagekit.io", "images.compara.ar"],
    format: ["avif", "webp"],
    quality: 80,
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || SITE_CONFIG.baseUrl,
      siteUrl: SITE_CONFIG.baseUrl,
      siteName: SITE_CONFIG.name,
      siteDescription: currenciesConfig.usd.description,
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "es-AR",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: `${SITE_CONFIG.name} | Cotizaciones en tiempo real`,
      meta: [
        {
          name: "description",
          content: currenciesConfig.usd.description,
        },
        {
          name: "keywords",
          content: currenciesConfig.usd.keywords.join(", "),
        },
        { name: "author", content: SITE_CONFIG.name },
        // ... rest of meta tags

        { name: "format-detection", content: "telephone=no" },
        { name: "theme-color", content: "#10b981" },
        { name: "msapplication-TileColor", content: "#10b981" },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "ComparaDólar" },
        { property: "og:locale", content: "es_AR" },
        {
          property: "og:image",
          content: "https://comparadolar.ar/assets/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:creator", content: "@enzonotario_" },
      ],
      noscript: [
        {
          children:
            '<div class="max-w-7xl mx-auto px-4 py-4 border-b border-zinc-200 dark:border-zinc-700"><p class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Navegación:</p><nav class="flex flex-wrap gap-x-4 gap-y-1 text-sm"><a href="/">Inicio</a><a href="/graficos">Gráficos</a><a href="/terminal">Terminal</a><a href="/sumarse">Sumarse</a></nav></div>',
        },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/assets/favicon.png" },
        {
          rel: "preload",
          href: "/assets/favicon.png",
          as: "image",
          type: "image/png",
        },
        { rel: "preconnect", href: "https://ik.imagekit.io" },
        { rel: "dns-prefetch", href: "https://ik.imagekit.io" },
        { rel: "preconnect", href: "https://dolarapi.com" },
        { rel: "dns-prefetch", href: "https://dolarapi.com" },
        { rel: "preconnect", href: "https://api.argentinadatos.com" },
        { rel: "dns-prefetch", href: "https://api.argentinadatos.com" },
        { rel: "preconnect", href: "https://www.googletagmanager.com" },
        { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
      ],
    },
  },

  gtag: { id: "G-60ZETC472S" },

  echarts: {
    charts: ["LineChart", "BarChart", "ScatterChart"],
    components: [
      "DatasetComponent",
      "GridComponent",
      "TooltipComponent",
      "LegendComponent",
      "DataZoomComponent",
    ],
  },
});
