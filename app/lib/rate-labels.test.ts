import test from "node:test";
import assert from "node:assert/strict";

import { RATE_DISPLAY, RATE_LABELS, RATE_LABELS_UPPER } from "./rate-labels";

test("Compras a usa la semántica visual del index", () => {
  assert.deepEqual(RATE_DISPLAY.ask, {
    label: "Compras a",
    icon: "i-heroicons-arrow-down",
    textClass: "text-green-600",
    darkTextClass: "dark:text-green-400",
    chartColor: "#16a34a",
    chartAreaStart: "rgba(22, 163, 74, 0.3)",
    chartAreaEnd: "rgba(22, 163, 74, 0.05)",
  });
});

test("Vendes a usa la semántica visual del index", () => {
  assert.deepEqual(RATE_DISPLAY.bid, {
    label: "Vendes a",
    icon: "i-heroicons-arrow-up",
    textClass: "text-red-600",
    darkTextClass: "dark:text-red-400",
    chartColor: "#dc2626",
    chartAreaStart: "rgba(220, 38, 38, 0.3)",
    chartAreaEnd: "rgba(220, 38, 38, 0.05)",
  });
});

test("los labels públicos salen de las constantes compartidas", () => {
  assert.equal(RATE_LABELS.ask, RATE_DISPLAY.ask.label);
  assert.equal(RATE_LABELS.bid, RATE_DISPLAY.bid.label);
  assert.equal(RATE_LABELS_UPPER.ask, "COMPRAS A");
  assert.equal(RATE_LABELS_UPPER.bid, "VENDES A");
});
