import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../server/index.js", import.meta.url), "utf8");
const apiSource = fs.readFileSync(new URL("../client/src/api.js", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../client/src/App.jsx", import.meta.url), "utf8");

const sharedFiles = [
  "01-Ordering-Process.pdf",
  "02-Limited-Product-Warranty.pdf"
];

for (const name of sharedFiles) {
  const fileUrl = new URL(`../invoice-supplements/${name}`, import.meta.url);
  assert.equal(fs.existsSync(fileUrl), true, `${name} should exist in the shared supplement folder.`);
  const bytes = fs.readFileSync(fileUrl);
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF", `${name} should be a valid PDF.`);
}

assert.match(serverSource, /repositorySupplementsDirectory/);
assert.match(serverSource, /path\.join\(__dirname, "\.\.", "invoice-supplements"\)/);
assert.match(serverSource, /app\.get\("\/api\/supplements"/);
assert.match(apiSource, /getRepositorySupplements/);
assert.match(apiSource, /Could not load company-wide quote supplements/);
assert.match(appSource, /Company-wide/);
assert.match(appSource, /supplement\.storage === "repository"/);
assert.match(appSource, /className="supplement-lock">Included/);

console.log("Company-wide supplement test passed.");
