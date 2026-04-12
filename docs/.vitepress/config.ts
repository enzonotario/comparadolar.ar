import { defineConfig } from "vitepress";
import { useSidebar } from "vitepress-openapi";
import { GOOGLE_ANALYTICS_ID } from "./analytics";
import spec from "../public/openapi.json" with { type: "json" };

const sidebar = useSidebar({
  spec,
  // Optionally, you can specify a link prefix for all generated sidebar items.
  linkPrefix: "/operations/",
});

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  base: "/docs/",
  outDir: "../public/docs",
  lang: "en-US",
  title: "ComparaDolar API",
  description:
    "API pública de comparadolar.ar para cotizaciones de dólar y criptomonedas en Argentina.",

  head: [
    ["link", { rel: "preconnect", href: "https://www.googletagmanager.com" }],
    ["link", { rel: "dns-prefetch", href: "https://www.googletagmanager.com" }],
    [
      "script",
      {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`,
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ANALYTICS_ID}');`,
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://comparadolar.ar/assets/og-image.png",
      },
    ],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "600" }],
    [
      "meta",
      {
        property: "og:image:alt",
        content: "ComparaDolar API",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://comparadolar.ar/assets/og-image.png",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],

  themeConfig: {
    nav: [
      { text: "comparadolar.ar", link: "https://comparadolar.ar/" },
      { text: "Sponsors", link: "/sponsors" },
    ],

    sidebar: [...sidebar.itemsByPaths()],
  },
  /** Give each dynamic page its own <title> */
  transformPageData(pageData) {
    // params returned from [*].paths.js|ts are available here
    const pageTitle = pageData.params?.pageTitle;

    if (pageTitle) {
      pageData.title = pageTitle;
      pageData.frontmatter ??= {};
      pageData.frontmatter.title = pageTitle;
    }
  },
});
