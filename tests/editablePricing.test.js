import assert from "node:assert/strict";
import fs from "node:fs";
import { pricingData } from "../server/pricingData.js";

const editable = JSON.parse(
  fs.readFileSync(new URL("../EDIT-PRICING-HERE.json", import.meta.url), "utf8")
);

assert.equal(editable.discountPercentages.Retail.Low, 18);
assert.equal(pricingData.discounts.Retail.Low, 0.18);
assert.equal(
  pricingData.styles.Traditional.pricePerSf,
  editable.basePricesPerSquareFoot.Traditional
);
assert.equal(
  pricingData.addOns[0].name,
  editable.addOns[0].name
);
assert.equal(
  pricingData.addOns[0].prices.Traditional,
  editable.addOns[0].pricesByStyle.Traditional
);

console.log("Editable repository pricing file test passed.");
