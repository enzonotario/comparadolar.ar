import type { CurrencyType } from "@/lib/types";
import { currenciesConfig, getCurrencyConfig } from "@/lib/currencies-config";

interface SeoOptions {
  currency?: CurrencyType;
  title?: string | ComputedRef<string>;
  description?: string | ComputedRef<string>;
  image?: string | ComputedRef<string>;
  url?: string | ComputedRef<string>;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[] | ComputedRef<string[]>;
}

const baseUrl = "https://comparadolar.ar";
const defaultImage = "https://comparadolar.ar/assets/og-image.png";

export function useSeo(options: SeoOptions = {}) {
  const route = useRoute();

  const currencyConfig = options.currency
    ? getCurrencyConfig(options.currency)
    : null;

  const title =
    options.title ||
    (currencyConfig
      ? `Comparar ${currencyConfig.fullName} - Compará Dólar`
      : "ComparaDólar | Cotizaciones Dólar en tiempo real");

  const description =
    options.description ||
    (currencyConfig
      ? currencyConfig.description
      : currenciesConfig.usd.description);

  const keywords = options.tags
    ? options.tags
    : currencyConfig
      ? currencyConfig.keywords
      : ["dolar", "cotizaciones", "argentina", "tipo de cambio", "comparador"];

  const url = options.url || computed(() => `${baseUrl}${route.path}`);

  const type = options.type || "website";
  const author = options.author || "ComparaDólar";

  const image = options.image || defaultImage;

  const keywordsString = computed(() => {
    const kw = isRef(keywords) ? keywords.value : keywords;
    return Array.isArray(kw) ? kw.join(", ") : String(kw);
  });

  useHead({
    title,
    meta: [
      { name: "description", content: description },
      { name: "keywords", content: keywordsString },
      { name: "author", content: author },
      { name: "robots", content: "index, follow" },

      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: title },
      { property: "og:site_name", content: "ComparaDólar" },
      { property: "og:locale", content: "es_AR" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: title },
      { name: "twitter:creator", content: "@enzonotario_" },

      ...(type === "article"
        ? [
            { property: "article:author", content: author },
            {
              property: "article:section",
              content: options.section || "Finanzas",
            },
            ...(options.publishedTime
              ? [
                  {
                    property: "article:published_time",
                    content: options.publishedTime,
                  },
                ]
              : []),
            ...(options.modifiedTime
              ? [
                  {
                    property: "article:modified_time",
                    content: options.modifiedTime,
                  },
                ]
              : []),
            ...(options.tags
              ? options.tags.map((tag) => ({
                  property: "article:tag",
                  content: tag,
                }))
              : []),
          ]
        : []),
    ],
    link: [{ rel: "canonical", href: url }],
  });

  return {
    title,
    description,
    url,
    image,
    keywords,
  };
}

export function useStructuredData(
  options: {
    currency?: CurrencyType;
    type?: "WebSite" | "WebPage" | "Organization" | "FinancialProduct";
  } = {},
) {
  const route = useRoute();
  const config = useRuntimeConfig();

  const currencyConfig = options.currency
    ? getCurrencyConfig(options.currency)
    : null;
  const baseUrl = config.public.siteUrl;
  const currentUrl = `${baseUrl}${route.path}`;

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ComparaDólar",
    url: baseUrl,
    logo: "https://ik.imagekit.io/ferminrp/Meta%20Images/comparadolar-logo.png",
    description:
      "Plataforma para comparar cotizaciones de dólar y criptomonedas en Argentina",
    sameAs: [
      "https://twitter.com/comparadolar",
      "https://github.com/comparadolar",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hi@enzonotario.me",
    },
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ComparaDólar",
    url: baseUrl,
    description: config.public.siteDescription,
    publisher: {
      "@type": "Organization",
      name: "ComparaDólar",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: currencyConfig
      ? `Cotizaciones ${currencyConfig.fullName} en tiempo real`
      : "ComparaDólar | Cotizaciones Dólar en tiempo real",
    description: currencyConfig
      ? currencyConfig.description
      : config.public.siteDescription,
    url: currentUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "ComparaDólar",
      url: baseUrl,
    },
    about: {
      "@type": "Thing",
      name: currencyConfig ? currencyConfig.fullName : "Dólar",
      description: currencyConfig
        ? currencyConfig.description
        : "Cotizaciones de dólar en Argentina",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: baseUrl,
        },
        ...(currencyConfig
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: currencyConfig.fullName,
                item: currentUrl,
              },
            ]
          : []),
      ],
    },
  };

  const financialProductData = currencyConfig
    ? {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: currencyConfig.fullName,
        description: currencyConfig.description,
        provider: {
          "@type": "Organization",
          name: "ComparaDólar",
        },
        category: "Currency Exchange",
        url: currentUrl,
        image: "https://comparadolar.ar/assets/og-image.png",
      }
    : null;

  let structuredData = [];

  if (options.type === "Organization") {
    structuredData = [organizationData];
  } else if (options.type === "WebSite") {
    structuredData = [websiteData];
  } else if (options.type === "FinancialProduct" && financialProductData) {
    structuredData = [financialProductData, webPageData];
  } else {
    structuredData = [webPageData, organizationData];
  }

  useHead({
    script: structuredData.map((data) => ({
      type: "application/ld+json",
      innerHTML: JSON.stringify(data),
    })),
  });

  return {
    organizationData,
    websiteData,
    webPageData,
    financialProductData,
  };
}
