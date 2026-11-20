import { describe, expect, it } from "bun:test";
import { isSvgImageUrl } from "./image-url";

describe("isSvgImageUrl", () => {
  it("detects .svg paths", () => {
    expect(
      isSvgImageUrl("https://api.argentinadatos.com/static/logos/global66.svg"),
    ).toBe(true);
    expect(
      isSvgImageUrl(
        "https://api.argentinadatos.com/static/logos/takenos.svg?v=1",
      ),
    ).toBe(true);
  });

  it("rejects raster logos", () => {
    expect(
      isSvgImageUrl("https://api.argentinadatos.com/static/logos/astropay.png"),
    ).toBe(false);
    expect(isSvgImageUrl("/assets/logo.webp")).toBe(false);
    expect(isSvgImageUrl(null)).toBe(false);
  });
});
