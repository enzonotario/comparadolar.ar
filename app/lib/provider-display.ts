const FIWIND_LOGO_URL =
  "https://api.argentinadatos.com/static/logos/fiwind.png";

const PROVIDER_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  "fiwind-cripto": "Fiwind",
  "fiwind-mep": "Fiwind",
};

const VOII_LOGO_URL =
  "https://api.argentinadatos.com/static/logos/banco-voii.jpg";

const FORCED_PROVIDER_LOGOS: Record<string, string> = {
  "voii-oficial": VOII_LOGO_URL,
};

const PROVIDER_LOGO_OVERRIDES: Record<string, string> = {
  fiwind: FIWIND_LOGO_URL,
  "fiwind-cripto": FIWIND_LOGO_URL,
  "fiwind-mep": FIWIND_LOGO_URL,
};

export function getProviderLogoUrl(item: {
  slug?: string;
  logo?: string | null;
  logoUrl?: string | null;
}): string {
  const slug = item.slug?.toLowerCase();
  if (slug && FORCED_PROVIDER_LOGOS[slug]) return FORCED_PROVIDER_LOGOS[slug];

  const explicit = item.logoUrl || item.logo;
  if (explicit) return explicit;

  if (slug && PROVIDER_LOGO_OVERRIDES[slug]) {
    return PROVIDER_LOGO_OVERRIDES[slug];
  }

  return "";
}

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
