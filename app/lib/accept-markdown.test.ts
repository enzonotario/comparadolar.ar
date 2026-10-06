import test from "node:test";
import assert from "node:assert/strict";

import { parseAcceptHeader, prefersMarkdown } from "./accept-markdown";

test("prefers markdown when Accept is text/markdown", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
});

test("prefers markdown when markdown ranks above html", () => {
  assert.equal(prefersMarkdown("text/markdown, text/html;q=0.8"), true);
});

test("prefers html for browser-like Accept", () => {
  assert.equal(
    prefersMarkdown(
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ),
    false,
  );
});

test("missing Accept defaults to html", () => {
  assert.equal(prefersMarkdown(undefined), false);
  assert.equal(prefersMarkdown(""), false);
  assert.equal(prefersMarkdown("*/*"), false);
});

test("q=0 on markdown falls through to html", () => {
  assert.equal(prefersMarkdown("text/markdown;q=0, text/html"), false);
});

test("parseAcceptHeader sorts by q then specificity", () => {
  const parsed = parseAcceptHeader("text/html;q=0.8, text/markdown, */*;q=0.1");
  assert.equal(parsed[0]?.type, "text");
  assert.equal(parsed[0]?.subtype, "markdown");
});
