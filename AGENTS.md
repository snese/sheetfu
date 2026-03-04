# AGENTS.md

## Project Overview

SheetFu — Google Sheets 家庭財務管理 + 可選 Web Dashboard

## Architecture

```
Google Sheets (GOOGLEFINANCE formulas)
    ↕ googleapis npm
Next.js 14 API Routes (read/write proxy)
    ↕
Frontend (read-only dashboard + /add form)
    ↕
Cloudflare Access (authentication via cf-access-authenticated-user-email)
```

- Google Sheets = source of truth (formulas calculate everything)
- ISR `revalidate=600` — matches GOOGLEFINANCE ~10min delay
- Cloudflare Access provides auth; middleware validates email header

## Key Files

| File | Purpose |
|------|---------|
| `lib/sheets/schema.ts` | TypeScript types + `SHEET_RANGES` — THE contract |
| `lib/sheets/reader.ts` | Sheets API read logic (in-memory cache, 5min TTL) |
| `lib/sheets/client.ts` | Sheets API client singleton |
| `middleware.ts` | API auth — validates `cf-access-authenticated-user-email` + `ALLOWED_EMAILS` |
| `app/api/` | API routes (dashboard, portfolio, transactions, health, revalidate) |
| `app/` | Frontend pages |

## Page Structure

| Route | Nav Label | PageHeader | Purpose |
|-------|-----------|------------|---------|
| `/` | 總覽 | (hero) | Dashboard — net worth, asset pie, mortgage, trend, holdings, recent tx |
| `/portfolio` | 持倉 | 持倉 | Full portfolio with charts |
| `/assets` | 資產 | 資產總覽 | Balance sheet + mortgage detail |
| `/add` | 記帳 | 新增交易 | Transaction form (client-side) |
| `/insurance` | 保單 | 保單 | Insurance policies |

## Development Rules

- NEVER recalculate P&L in code — Sheet formulas are source of truth
- All Sheets access goes through `lib/sheets/client.ts`
- `schema.ts` is the contract — change it, update reader + frontend
- ISR handles stale data when Sheets API is down (no snapshot fallback needed)
- `.env.local` for all secrets, never commit credentials
- `SHEET_RANGES` use unbounded ranges (e.g. `A1:B` not `A1:B33`) to avoid breakage when rows are added

## Auth

- Cloudflare Access sends `cf-access-authenticated-user-email` header
- `middleware.ts` validates this header for all `/api/*` routes (except `/api/health`)
- `ALLOWED_EMAILS` env var restricts to specific emails (optional, defense-in-depth)

## Testing

- `npm run build` — must pass
- `npx tsc --noEmit` — must pass
- API endpoints return valid JSON matching `schema.ts` types

## Common Tasks

### Add new Sheet tab
1. Add to `SHEET_TABS` + `SHEET_RANGES` in `schema.ts`
2. Add reader function in `reader.ts`
3. Add API route in `app/api/`

### Add new field
1. Update interface in `schema.ts`
2. Update reader mapping in `reader.ts`
3. Update frontend component
