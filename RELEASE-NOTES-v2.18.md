# v2.18 — Quote Backup Files

- Added a Project Backup section near the top of the estimator.
- Users can download a `.prestigequote` backup file containing the quote inputs.
- Users can upload a `.prestigequote` or JSON backup file to restore the quote later.
- Restored quotes recalculate using the current pricing table, so pricing updates remain current.
- Backup files include quote/customer/unit/additional item fields only; they do not include admin pricing tables, cost inputs, markups, or PDF supplements.
