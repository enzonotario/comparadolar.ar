import test from "node:test";
import assert from "node:assert/strict";

import {
  parseRemesaFee,
  simulateRemesaPayout,
  formatArsAmount,
} from "./remesas";

test("parsea comisiones en porcentaje, USD y rangos", () => {
  assert.deepEqual(parseRemesaFee("0"), {
    value: 0,
    unit: "percent",
    approximate: false,
    raw: "0",
  });
  assert.equal(parseRemesaFee("0.5%")?.value, 0.5);
  assert.equal(parseRemesaFee("0.5%")?.unit, "percent");
  assert.equal(parseRemesaFee("6,11 USD")?.value, 6.11);
  assert.equal(parseRemesaFee("6,11 USD")?.unit, "usd");
  assert.equal(parseRemesaFee("3 USD")?.value, 3);
  assert.equal(parseRemesaFee("5 USD")?.unit, "usd");
  assert.equal(parseRemesaFee("2%")?.value, 2);

  const range = parseRemesaFee("1% a 3%");
  assert.equal(range?.value, 3);
  assert.equal(range?.approximate, true);
});

test("simula el neto en ARS descontando recibir, retiro y precio de venta", () => {
  const base = { usdAmount: 1000, bid: 1500 };

  assert.equal(
    simulateRemesaPayout({
      ...base,
      costoRecibirPagos: "0",
      retiroArs: "0",
    })?.arsFinal,
    1_500_000,
  );

  assert.equal(
    simulateRemesaPayout({
      ...base,
      costoRecibirPagos: "1%",
      retiroArs: "0",
    })?.arsFinal,
    1_485_000,
  );

  assert.equal(
    simulateRemesaPayout({
      ...base,
      costoRecibirPagos: "3 USD",
      retiroArs: "0",
    })?.arsFinal,
    1_495_500,
  );

  assert.equal(
    simulateRemesaPayout({
      ...base,
      costoRecibirPagos: "0",
      retiroArs: "2%",
    })?.arsFinal,
    1_470_000,
  );

  assert.equal(
    simulateRemesaPayout({
      ...base,
      costoRecibirPagos: "0",
      retiroArs: "5 USD",
    })?.arsFinal,
    1_492_500,
  );
});

test("formatea ARS sin centavos", () => {
  assert.equal(formatArsAmount(1_567_050.4), "$ 1.567.050");
});
