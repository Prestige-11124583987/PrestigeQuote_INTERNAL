# Free Render Deployment

1. Upload all project files to the top level of the GitHub repository.
2. Connect the repository to a Render Web Service.
3. Select the Free instance.
4. Set Build Command to `npm install && npm run build`.
5. Set Start Command to `npm start`.
6. Add `NODE_ENV=production` and `NODE_VERSION=22.16.0`.
7. Do not add a persistent disk.
8. Deploy the latest commit.

Pricing and Quote Supplement PDFs are stored in each user's browser.

## Updating Default Pricing After Deployment

Edit `EDIT-PRICING-HERE.json` in GitHub and commit the change. Render will redeploy the defaults. Discounts are entered as whole percentages, such as `18` for 18%.

If a browser has temporary local pricing saved, open **Pricing & Options** and click **Discard Browser Edits & Use Repository Defaults**. Clearing browser cache is not required.

## Verify the Deployed Release

After deployment, confirm the repository contains `VERSION` with `2.14.0` and that `package.json` also shows version `2.14.0`.

## Verify Company-Wide Supplements

After deployment:

1. Open the Quote Supplements section.
2. Confirm `01-Ordering-Process.pdf` and `02-Limited-Product-Warranty.pdf` are labeled **Company-wide** and **Included**.
3. Generate a test Quote.
4. Confirm the Ordering Process and Limited Product Warranty append after the Quote pages.

No Render disk is required because these PDFs are committed with the repository.
