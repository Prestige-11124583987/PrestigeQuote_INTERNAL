# Prestige Internal Quote Tool v2.7

## v2.8 Quote Builder Updates

- Pricing & Options is collapsed by default.
- Unit cards can be duplicated with all specifications and add-ons.
- Work Scope items can be selected for each quote.
- Installation appears as one separate quote line instead of being allocated to each door.
- Total Package Price is highlighted in Prestige green.

Internal quote builder for Prestige Iron Doors & Glazing.

## Current behavior

- Customer-facing PDFs are titled **Quote**, including continuation pages.
- Up to five standard door rows fit on the first quote page. A door and all of its specifications remain together on one page.
- Quote supplements are stored in the current browser and appended behind the generated quote PDF.
- Pricing changes are stored in the current browser, so no paid Render disk is required.
- The pricing editor contains selling prices only. Cost, markup, and margin data are not exposed or calculated.
- Team members can edit base style selling prices, add-on names, add-on selling prices, installation prices, discounts, and dropdown options.

## Free Render setup

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: `NODE_ENV=production` and `NODE_VERSION=22.16.0`
- No persistent disk is required.

Browser-local edits are device-specific. Changes made on one salesperson's browser do not automatically appear on another device.

## Calculation rule

The door-unit retail price equals the base door price plus every selected add-on. The door discount applies to that entire amount. Installation is separate. The production deposit equals 50% of the discounted door-unit price and excludes installation.

## Easy Repository Pricing Updates

Edit the root-level `EDIT-PRICING-HERE.json` file to change default prices, discounts, add-on names, installation pricing, and dropdown options without editing application code.

See `EDIT-PRICING-GUIDE.md` for step-by-step instructions. Discounts in this file are entered as whole percentages, so `18` means 18%.

Browser-only salesperson edits can be removed inside **Pricing & Options** by clicking **Discard Browser Edits & Use Repository Defaults**. Clearing browser cache is not required.
