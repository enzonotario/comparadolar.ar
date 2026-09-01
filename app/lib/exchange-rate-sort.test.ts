import test from "node:test";
import assert from "node:assert/strict";

import {
  compareExchangeRatesByPrice,
  compareExchangeRatesForBuy,
  compareExchangeRatesForSell,
} from "./exchange-rate-sort";

test("mismo ask prioriza menor spread antes que el nombre", () => {
  const uala = {
    slug: "uala",
    name: "Ualá",
    ask: 1525,
    bid: 1505,
  };
  const hipotecario = {
    slug: "hipotecario",
    name: "Banco Hipotecario",
    ask: 1525,
    bid: 1490,
  };

  assert.ok(compareExchangeRatesForBuy(uala, hipotecario) < 0);
});

test("precio más bajo sigue ganando aunque el spread sea mayor", () => {
  const cheaper = {
    slug: "cheap",
    name: "Cheap",
    ask: 1520,
    bid: 1490,
  };
  const tiedSpread = {
    slug: "tight",
    name: "Tight",
    ask: 1525,
    bid: 1520,
  };

  assert.ok(compareExchangeRatesForBuy(cheaper, tiedSpread) < 0);
});

test("mismo bid prioriza menor spread al vender", () => {
  const tight = {
    slug: "tight",
    name: "Tight",
    ask: 1535,
    bid: 1500,
  };
  const wide = {
    slug: "wide",
    name: "Wide",
    ask: 1600,
    bid: 1500,
  };

  assert.ok(compareExchangeRatesForSell(tight, wide) < 0);
});

test("compareExchangeRatesByPrice respeta la dirección del sort", () => {
  const low = { slug: "low", name: "Low", ask: 1520, bid: 1500 };
  const high = { slug: "high", name: "High", ask: 1530, bid: 1510 };

  assert.ok(compareExchangeRatesByPrice(low, high, "ask", false) < 0);
  assert.ok(compareExchangeRatesByPrice(low, high, "ask", true) > 0);
});
