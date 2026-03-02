# Setup Guide

## Prerequisites

- Node.js 18+
- A Google account
- A Google Cloud project

## 1. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**
   - Navigate to APIs & Services → Library
   - Search "Google Sheets API" → Enable
4. Create Service Account
   - Navigate to APIs & Services → Credentials
   - Click "Create Credentials" → Service Account
   - Name: `sheetfu` (or any name)
   - Click "Create and Continue"
   - Role: skip (no role needed)
   - Click "Done"
5. Create Key
   - Click on the service account you just created
   - Keys tab → Add Key → Create new key → JSON
   - Save the downloaded JSON file

<!-- TODO: Add screenshots -->

## 2. Share Sheet with Service Account

1. Open your SheetFu template in Google Sheets
2. Click "Share"
3. Paste the service account email (from the JSON file, `client_email` field)
4. Set permission to **Editor**
5. Uncheck "Notify people" → Share

## 3. Configure Environment

Create `.env.local` in the project root:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-from-url
```

The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## 4. Verify

```bash
npm run dev
# Open http://localhost:3000
# If you see your data, setup is complete.
```
