import { prefersMarkdown } from "../../app/lib/accept-markdown";
import {
  markdownForPath,
  NOT_FOUND_MARKDOWN,
  shouldSkipMarkdownNegotiation,
} from "../../app/lib/agent-markdown";
import { isValidCurrency } from "../../app/lib/currencies-config";

const KNOWN_APP_PREFIXES = new Set([
  "terminal",
  "graficos",
  "remesas",
  "sumarse",
  "mockups",
  "about",
  "contact",
  "privacy",
  "og-brand",
  "usd-ccl",
]);

/**
 * Content negotiation for Accept: text/markdown (acceptmarkdown.com).
 * Known static Markdown paths → 200. Paths that cannot match the app → 404 Markdown.
 * Valid app routes without a Markdown twin fall through to Nuxt (HTML).
 */
export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname;
  if (shouldSkipMarkdownNegotiation(pathname)) return;

  // Advertise negotiation for caches (HTML + Markdown twins).
  appendResponseHeader(event, "Vary", "Accept");

  const accept = getHeader(event, "accept");
  if (!prefersMarkdown(accept)) return;

  const body = markdownForPath(pathname);
  if (body) {
    setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
    setResponseStatus(event, 200);
    return body;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const mayBeAppRoute =
    isValidCurrency(firstSegment) || KNOWN_APP_PREFIXES.has(firstSegment);

  if (mayBeAppRoute) return;

  setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  setResponseStatus(event, 404, "Not Found");
  return NOT_FOUND_MARKDOWN;
});
