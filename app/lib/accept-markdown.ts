/**
 * Accept: text/markdown negotiation helpers.
 * Spec: https://acceptmarkdown.com/guides/accept-parsing
 */

export type AcceptMediaRange = {
  type: string;
  subtype: string;
  q: number;
  specificity: number;
};

function specificity(type: string, subtype: string): number {
  if (type === "*" && subtype === "*") return 0;
  if (subtype === "*") return 1;
  return 2;
}

/** Parse Accept into ranked media ranges (highest preference first). */
export function parseAcceptHeader(acceptHeader: string | null | undefined): AcceptMediaRange[] {
  if (acceptHeader == null || acceptHeader.trim() === "") {
    return [{ type: "*", subtype: "*", q: 1, specificity: 0 }];
  }

  const ranges: AcceptMediaRange[] = [];

  for (const part of acceptHeader.split(",")) {
    const segments = part.trim().split(";").map((s) => s.trim());
    const [rawType = "*/*"] = segments;
    const [type = "*", subtype = "*"] = rawType.toLowerCase().split("/");

    let q = 1;
    for (const param of segments.slice(1)) {
      const [key, value] = param.split("=").map((s) => s.trim());
      if (key?.toLowerCase() === "q" && value != null) {
        const parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }

    ranges.push({
      type,
      subtype,
      q,
      specificity: specificity(type, subtype),
    });
  }

  return ranges.sort((a, b) => {
    if (b.q !== a.q) return b.q - a.q;
    return b.specificity - a.specificity;
  });
}

/**
 * Prefer Markdown when text/markdown outranks text/html among acceptable types.
 * Missing Accept or a catch-all media range → HTML (default).
 */
export function prefersMarkdown(acceptHeader: string | null | undefined): boolean {
  const ranges = parseAcceptHeader(acceptHeader);

  for (const range of ranges) {
    if (range.q <= 0) continue;

    const wildType = range.type === "*";
    const wildSubtype = range.subtype === "*";

    // Concrete types decide first; wildcards mean "default" → HTML.
    if (!wildType && !wildSubtype) {
      if (range.type === "text" && range.subtype === "markdown") return true;
      if (range.type === "text" && range.subtype === "html") return false;
      continue;
    }

    return false;
  }

  return false;
}
