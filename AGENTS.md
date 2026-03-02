# AGENTS.md

## Project Overview

SheetFu — Google Sheets 家庭財務管理 + 可選 Web Dashboard

## Architecture

- Google Sheets = source of truth (formulas calculate everything)
- Next.js API Routes = read/write proxy to Sheets
- Frontend = read-only dashboard + transaction form

## Key Files

- `lib/sheets/schema.ts` — TypeScript types, column mapping (THE contract)
- `lib/sheets/reader.ts` — Sheets API read logic
- `lib/sheets/client.ts` — Sheets API client (all access goes through here)
- `app/api/` — API routes
- `app/` — Frontend pages

## Development Rules

- NEVER recalculate P&L in code (Sheet formulas are source of truth)
- All Sheets access goes through `lib/sheets/client.ts`
- `schema.ts` is the contract between API and frontend — change it, update both
- ISR revalidate: 600s (matches GOOGLEFINANCE delay)
- `.env.local` for all secrets, never commit credentials

## Testing

- `npm run build` — must pass
- `npx tsc --noEmit` — must pass
- API endpoints return valid JSON matching `schema.ts` types

## Common Tasks

### Add new Sheet tab

1. Update `SHEET_TABS` + `SHEET_RANGES` in `schema.ts`
2. Add reader function in `reader.ts`
3. Add API route in `app/api/`

### Add new field

1. Update interface in `schema.ts`
2. Update reader mapping in `reader.ts`
3. Update frontend component
