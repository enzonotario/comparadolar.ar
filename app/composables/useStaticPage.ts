interface UseStaticPageOptions {
  title: string;
  description: string;
  structuredDataType?: "WebPage";
  robots?: string;
}

export function useStaticPage({
  title,
  description,
  structuredDataType = "WebPage",
  robots,
}: UseStaticPageOptions) {
  useSeo({ title, description });

  useStructuredData({ type: structuredDataType });

  if (robots) {
    useHead({
      meta: [{ name: "robots", content: robots }],
    });
  }
}
