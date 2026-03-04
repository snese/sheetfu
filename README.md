# SheetFu 📊

> Manage family finances with Google Sheets. Optional Next.js dashboard.

## Why SheetFu?

- Google Sheets as single source of truth (formulas do all calculations)
- Two modes: Simple (just Sheets) or Pro (+ Web Dashboard)
- Universal: any currency, any market GOOGLEFINANCE supports
- Mobile-friendly PWA with offline support

## Quick Start

### Simple Mode (Zero Setup)

1. Copy the template: `SHEET_ID=xxx node scripts/create-template.mjs`
2. Delete example data, enter your own transactions
3. Done. Portfolio, P&L, balance sheet auto-calculate.

### Pro Mode (Web Dashboard)

1. Create template (same as above)
2. Clone this repo
3. Set up Google Service Account (see [docs/setup.md](docs/setup.md))
4. `cp .env.example .env.local` and fill in your values
5. `npm install && npm run dev`
6. Deploy with Cloudflare Access (see [docs/deploy.md](docs/deploy.md))

## Tech Stack

- Google Sheets (GOOGLEFINANCE, SUMIFS, UNIQUE, XLOOKUP)
- Next.js 14 + Tailwind CSS + shadcn/ui + Recharts
- ISR (revalidate every 10 min, matches GOOGLEFINANCE delay)
- PWA with offline support
- Cloudflare Access (authentication)

## Documentation

- [Setup Guide](docs/setup.md)
- [Sheet Template Guide](docs/sheet-template.md)
- [Deployment Guide](docs/deploy.md)
- [FAQ](docs/faq.md)

## For AI Agents

See [AGENTS.md](AGENTS.md)

## License

MIT

---

[繁體中文版](README.zh-TW.md)
