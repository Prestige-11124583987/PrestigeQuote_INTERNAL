# Company-Wide Quote Supplement Guide

The `invoice-supplements/` folder controls the PDFs that every salesperson receives behind each generated Quote.

## Add a Shared PDF

1. Open the GitHub repository.
2. Open `invoice-supplements`.
3. Choose **Add file → Upload files**.
4. Upload the PDF.
5. Use a numbered filename such as `03-Care-and-Maintenance.pdf`.
6. Commit the change.
7. Allow Render to redeploy, or choose **Manual Deploy → Deploy latest commit**.

After deployment, the PDF appears in the app as **Company-wide** and **Included** and automatically appends behind every Quote.

## Replace a Shared PDF

Upload the revised PDF using the exact same filename and commit the replacement. After Render redeploys, everyone receives the new version.

## Remove a Shared PDF

Delete the PDF from `invoice-supplements/`, commit the deletion, and redeploy.

## Change the Order

Files append alphabetically and numerically by filename. Rename the prefixes to control the sequence:

- `01-Ordering-Process.pdf`
- `02-Limited-Product-Warranty.pdf`
- `03-Care-and-Maintenance.pdf`

## Browser-Only PDFs

PDFs uploaded through the app are stored only in that browser. Use browser uploads for optional or quote-specific documents. Use the GitHub folder for anything that must appear for everyone.
