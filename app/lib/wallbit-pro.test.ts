import test from "node:test";
import assert from "node:assert/strict";

import { omitDuplicateWallbitPro } from "./wallbit-pro";

const wallbit = {
  slug: "wallbit",
  ask: 1617.84,
  bid: 1582.39,
};
const wallbitPro = {
  slug: "wallbit-pro",
  ask: 1617.84,
  bid: 1586.34,
};
const other = { slug: "uala", ask: 1530, bid: 1515 };

test("en Compras a oculta Wallbit Pro si el ask coincide", () => {
  const result = omitDuplicateWallbitPro([wallbitPro, other, wallbit], "ask");
  assert.deepEqual(
    result.map((rate) => rate.slug),
    ["uala", "wallbit"],
  );
});

test("en Vendes a conserva Wallbit Pro si el bid es distinto", () => {
  const result = omitDuplicateWallbitPro([wallbitPro, wallbit], "bid");
  assert.deepEqual(
    result.map((rate) => rate.slug),
    ["wallbit-pro", "wallbit"],
  );
});

test("en Vendes a oculta Wallbit Pro si el bid coincide", () => {
  const result = omitDuplicateWallbitPro(
    [wallbitPro, { ...wallbit, bid: wallbitPro.bid }],
    "bid",
  );
  assert.deepEqual(
    result.map((rate) => rate.slug),
    ["wallbit"],
  );
});

test("en Compras a conserva Wallbit Pro si el ask es distinto", () => {
  const result = omitDuplicateWallbitPro(
    [{ ...wallbitPro, ask: 1600 }, wallbit],
    "ask",
  );
  assert.deepEqual(
    result.map((rate) => rate.slug),
    ["wallbit-pro", "wallbit"],
  );
});

test("sin Wallbit no oculta Wallbit Pro", () => {
  const result = omitDuplicateWallbitPro([wallbitPro, other], "ask");
  assert.equal(result.length, 2);
});
