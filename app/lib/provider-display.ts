const PROVIDER_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  "fiwind-cripto": "Fiwind",
  "fiwind-mep": "Fiwind",
};

export function getProviderDisplayName(item: {
  slug?: string;
  name?: string;
  prettyName?: string;
}): string {
  const slug = item.slug?.toLowerCase();
  if (slug && PROVIDER_DISPLAY_NAME_OVERRIDES[slug]) {
    return PROVIDER_DISPLAY_NAME_OVERRIDES[slug];
  }

  return item.prettyName || item.name || item.slug || "";
}

export function applyProviderDisplayName<
  T extends { slug?: string; prettyName?: string; displayName?: string },
>(item: T): T {
  const displayName = getProviderDisplayName(item);
  if (displayName === (item.prettyName || item.name || item.slug || "")) {
    return item;
  }

  return {
    ...item,
    prettyName: displayName,
    displayName,
  };
}
