# Release Notes v2.19.0

## Added

- 120-character Notes field on every unit, included on the customer-facing Quote.
- Purple Effective Price / SF indicator on every unit input card.
- Installation Deposit % input, defaulting to 0%.
- Automatic Schedule of Values page with four billing milestones.
- Salesperson email and phone directly beneath the salesperson name on the Quote.

## Billing Logic

- Due Today remains the Production Deposit only.
- An Installation Deposit, when entered, is calculated from discounted installation cost but is not added to Due Today.
- Production Completion is the remaining product balance after the Production Deposit.
- Installation Completion is the remaining installation balance after any Installation Deposit.
- Paper checks may delay production because production does not begin until required deposit funds are received and cleared by Prestige; electronic payment methods are recommended.

## Effective Price / SF

Effective Price / SF = discounted per-unit product price (base unit plus selected add-ons, after the unit discount) divided by total unit square footage. Installation is excluded.
