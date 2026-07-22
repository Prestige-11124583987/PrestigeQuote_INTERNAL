# v2.8 Changes

- Changed the **Add Unit** control to a full-width, subtle red rounded button.
- Made **Pricing & Options** a collapsed-by-default dropdown while preserving browser-local editing of sell prices, add-on names, discounts, installation pricing, and dropdown choices.
- Added a **Duplicate** button to each unit card that copies every specification and selected add-on into a new unit.
- Added selectable **Work Scope** items to each quote:
  - Furnish new Prestige door(s)/window(s).
  - Remove existing Door(s).
  - Install Prestige door(s)/window(s).
  - Complete all associated finish work.
- Added selected work-scope items to both the preview and generated PDF.
- Capitalized section headings and customer-facing line-item labels.
- Highlighted **Total Package Price** in Prestige green in both the preview and generated PDF.
- Removed installation from individual door rows. Door rows now show door-and-add-on retail, discount, and final door price only.
- Added one separate **Installation** line showing installation retail, installation discount, and final installation price.
- Kept the production deposit based only on discounted door units, excluding installation.

## v2.9

- Fixed repository `pricingData.js` changes being ignored after a browser had saved Pricing & Options.
- Repository pricing is now fingerprinted automatically on each deployment.
- When repository pricing changes, stale full-browser pricing is cleared once so the new defaults—including Retail discounts—take effect.
- Browser-local edits continue to persist until the repository pricing source changes.

## v2.10

- Added root-level `EDIT-PRICING-HERE.json` for non-coder repository pricing updates.
- Repository discounts now use whole percentages such as `18` for 18%.
- Added `EDIT-PRICING-GUIDE.md` with GitHub editing instructions.
- Renamed the local reset action to **Discard Browser Edits & Use Repository Defaults**.
- Repository pricing requests bypass browser HTTP cache.
- Replaced the bottom quote notice with the approved taxes, validity, deposit, and balance language.

## v2.11

- Shows each door discount percentage as a positive percentage above the dollar discount in accounting parentheses.
- Displays zero discounts as a dash.
- Shows only the positive installation discount percentage on the installation line.
- Uses accounting parentheses for the Total Discounts card and door-total discount.
- Colors the Production Deposit heading dark red.
- Removes total square footage and build/job type from customer-facing door specifications.
- Adds a distinct Door Units Total line before the separate Installation line.
- Tightens the standard fixed door-row height while keeping detailed door rows indivisible and expandable when needed.
