const WSRV_ENDPOINT = "https://wsrv.nl/";

/**
 * Resize remote images (provider logos, etc.) via wsrv.nl so we don't
 * download 3000px PNGs for 16–32px UI icons. Local/relative URLs pass through.
 */
export function getResizedImageUrl(
  src: string | null | undefined,
  width: number,
  options: { quality?: number; format?: "webp" | "avif" | "png" } = {},
): string {
  if (!src) return "";
  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.hostname === "wsrv.nl" || url.hostname === "images.weserv.nl") {
      return src;
    }
  } catch {
    return src;
  }

  const params = new URLSearchParams({
    url: src,
    w: String(Math.ceil(width * 2)), // 2x for retina
    output: options.format ?? "webp",
    q: String(options.quality ?? 80),
    fit: "cover",
    a: "attention",
  });

  return `${WSRV_ENDPOINT}?${params.toString()}`;
}
