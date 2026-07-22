import assert from "node:assert/strict";
import fs from "node:fs";
import { pricingData } from "../server/pricingData.js";

const appSource = fs.readFileSync(new URL("../client/src/App.jsx", import.meta.url), "utf8");

assert.match(appSource, /"QUOTE"/);
assert.match(appSource, /Printable Quote/);
assert.doesNotMatch(appSource, /"INVOICE"|INVOICE — CONTINUED|INVOICE - CONTINUED/);
assert.doesNotMatch(appSource, /Internal margin panel|Manufacturer Cost|Cost \/ Prestige Price|<span>Cost<\/span>|>Markup</);

function assertNoInternalPricingKeys(value, path = "pricingData") {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    assert.equal(/cost|margin|markup/i.test(key), false, `Unexpected internal pricing key at ${path}.${key}`);
    assertNoInternalPricingKeys(child, `${path}.${key}`);
  }
}

assertNoInternalPricingKeys(pricingData);
console.log("UI policy test passed.");
