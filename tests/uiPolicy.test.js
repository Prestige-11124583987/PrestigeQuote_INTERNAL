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

assert.match(appSource, /className="add-unit-button"/);
assert.match(appSource, /className="secondary small-button duplicate-unit-button"/);
assert.match(appSource, /<details id="pricing-controls"/);
assert.doesNotMatch(appSource, /<details id="pricing-controls"[^>]*open/);
assert.match(appSource, /Furnish new Prestige door\(s\)\/window\(s\)\./);
assert.match(appSource, /drawInstallationLine/);
assert.match(appSource, /total-package-metric/);
assert.doesNotMatch(appSource, /Installation included:/);


assert.match(appSource, /Discard Browser Edits & Use Repository Defaults/);
assert.match(appSource, /EDIT-PRICING-HERE\.json/);
assert.match(appSource, /Applicable taxes, if any, are not included\. This quote is valid for thirty \(30\) days\./);
assert.match(appSource, /The remaining product balance is due prior to shipment\./);

console.log("UI policy test passed.");
