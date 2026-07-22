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
