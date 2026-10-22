import test from "node:test";
import assert from "node:assert/strict";

import { isBlacklistedProviderSlug } from "./market-constants";

test("pluscrypto queda en la blacklist y plus no", () => {
  assert.equal(isBlacklistedProviderSlug({ slug: "pluscrypto" }), true);
  assert.equal(isBlacklistedProviderSlug({ name: "PlusCrypto" }), true);
  assert.equal(isBlacklistedProviderSlug({ slug: "plus" }), false);
  assert.equal(isBlacklistedProviderSlug({ slug: "plus-crypto" }), false);
  assert.equal(isBlacklistedProviderSlug({ name: "Plus" }), false);
});
