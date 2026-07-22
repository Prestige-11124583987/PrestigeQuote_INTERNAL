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
