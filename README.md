# Prestige Internal Quote Tool v2.15

Internal quote builder for Prestige Iron Doors & Glazing.

## Release Status

- Repository release: **v2.15**
- Application package version: **2.15.0**
- Release history: see `CHANGES.md`
- Current release notes: see `RELEASE-NOTES-v2.15.md`

## Current Quote Builder

- Customer-facing PDFs are titled **Quote**, including continuation pages.
- Pricing & Options is collapsed by default.
- Unit cards can be duplicated with all dimensions, specifications, add-ons, quantity, and discount settings.
- Work Scope items can be selected for each quote.
- Installation appears as one separate quote line instead of being allocated to each door.
- Door and window rows show retail price, discount percentage, dollars saved, and discounted total.
- The quote includes separate **Doors / Windows** and **Installation** total lines.
- Summary cards use **Package Retail Price**, **Total Savings**, **Total Package Price**, and **Production Deposit**.
- The quote terms notice appears directly below the summary cards and immediately above the itemized specifications table.
- Total Package Price is highlighted in Prestige green, and the Production Deposit heading is dark red.

## Replaceable Quote Header

The on-screen Quote preview and every generated Quote page use:

`public/branding/quote-header.png`

Replace that file in GitHub while keeping the exact filename, commit the change, and let Render redeploy. The app preserves the image proportions, does not crop it, prevents stale branding cache, and falls back to a text header if the file is missing.

See `public/branding/README.md` for the image recommendations.

## Company-Wide Quote Supplements

Approved PDFs committed to the root-level `invoice-supplements/` folder are automatically loaded for every salesperson and appended behind each generated Quote in filename order.

No default supplement PDFs ship in v2.15. The unapproved retyped v2.14 documents were removed so altered source language cannot be distributed accidentally. Add only final approved PDFs. See `SUPPLEMENT-GUIDE.md`.

Salespeople may also upload optional PDFs in the app. Those uploads remain browser-specific and are appended in addition to any company-wide documents.

## Current Behavior

- Up to five standard door rows fit on the first quote page.
- A door and all of its specifications remain together on one page.
- Repository supplements are company-wide after deployment.
- Browser-uploaded supplements remain specific to the browser that uploaded them.
- Pricing changes are stored in the current browser, so no paid Render disk is required.
- The pricing editor contains selling prices only. Cost, markup, and margin data are not exposed or calculated.
- Team members can edit base style selling prices, add-on names, add-on selling prices, installation prices, discounts, and dropdown options.

## Free Render Setup

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: `NODE_ENV=production` and `NODE_VERSION=22.16.0`
- No persistent disk is required.

Browser-local pricing edits and optional browser uploads are device-specific. Repository supplements are shared with everyone after deployment.

## Calculation Rule

The door-unit retail price equals the base door price plus every selected add-on. The door discount applies to that entire amount. Installation is separate. The production deposit equals 50% of the discounted door-unit price and excludes installation.

## Easy Repository Pricing Updates

Edit the root-level `EDIT-PRICING-HERE.json` file to change default prices, discounts, add-on names, installation pricing, and dropdown options without editing application code.

See `EDIT-PRICING-GUIDE.md` for step-by-step instructions. Discounts in this file are entered as whole percentages, so `18` means 18%.

Browser-only salesperson edits can be removed inside **Pricing & Options** by clicking **Discard Browser Edits & Use Repository Defaults**. Clearing browser cache is not required.
