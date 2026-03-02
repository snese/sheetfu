# FAQ

## General

### What is SheetFu?

SheetFu is a family finance management tool built on Google Sheets. You can use it as a standalone spreadsheet, or add an optional Next.js web dashboard for a better viewing experience.

### Is my data safe?

Your data stays in your own Google Sheet. The web dashboard reads from your Sheet via a Service Account you control. No data is sent to third-party servers.

### Does it work with currencies other than USD?

Yes. SheetFu works with any currency. Set your currency in the Settings tab. GOOGLEFINANCE supports most global stock exchanges.

## Simple Mode

### Do I need to code anything?

No. Simple Mode is just a Google Sheet. Copy the template, enter your data, and the formulas handle everything.

### Can I use it on mobile?

Yes. Google Sheets works on mobile. If you use Pro Mode, the web dashboard is a PWA that works on mobile browsers with offline support.

## Pro Mode (Web Dashboard)

### Why do I need a Google Service Account?

The Service Account allows the web app to read your Sheet data via the Google Sheets API. It's like giving the app read/write access to your specific spreadsheet.

### Why Cloudflare?

Cloudflare Pages offers free hosting for static/SSR sites. Cloudflare Access provides simple email-based authentication to restrict access to family members. You can deploy elsewhere (Vercel, etc.) but you'll need to handle authentication yourself.

### Data seems delayed?

The dashboard uses ISR (Incremental Static Regeneration) with a 600-second revalidation interval. This matches GOOGLEFINANCE's ~15 minute delay. Your data will be at most 10 minutes behind the Sheet.

### How do I update to the latest version?

```bash
git pull origin main
npm install
npm run build
# Cloudflare Pages auto-deploys on push
```

## Troubleshooting

### "Error: Could not read spreadsheet"

- Verify `GOOGLE_SHEET_ID` is correct (from the Sheet URL)
- Verify the Service Account email has Editor access to the Sheet
- Verify `GOOGLE_PRIVATE_KEY` is correctly formatted (include `\n` line breaks)

### "GOOGLEFINANCE: Internal error"

This is a Google Sheets issue, not SheetFu. GOOGLEFINANCE occasionally has outages. Wait and it usually resolves within hours.

### Build fails with type errors

Run `npx tsc --noEmit` locally to see the errors. Most likely `schema.ts` was updated without updating the corresponding reader or component.
