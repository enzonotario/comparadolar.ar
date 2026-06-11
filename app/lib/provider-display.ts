const PROVIDER_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  "fiwind-cripto": "Fiwind",
  "fiwind-mep": "Fiwind",
};

export function applyProviderDisplayName<
  T extends { slug?: string; prettyName?: string; displayName?: string },
>(item: T): T {
  const slug = item.slug?.toLowerCase();
  if (!slug) return item;

  const override = PROVIDER_DISPLAY_NAME_OVERRIDES[slug];
  if (!override) return item;

  item.prettyName = override;
  item.displayName = override;
  return item;
}
