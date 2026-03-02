# Sheet Template Guide

## Overview

The SheetFu Google Sheet template is the core of the system. All calculations happen via Sheet formulas — the web dashboard only reads data.

## Tabs

| Tab | Purpose |
|-----|---------|
| Transactions | Daily income/expense entries |
| Portfolio | Investment holdings & market values |
| P&L | Profit & Loss (auto-calculated) |
| Balance Sheet | Assets, liabilities, net worth (auto-calculated) |
| Settings | Currency, categories, accounts |

## Transactions Tab

| Column | Description | Example |
|--------|-------------|---------|
| Date | Transaction date | 2026-01-15 |
| Category | Expense/income category | Food, Salary |
| Amount | Transaction amount | -350, 50000 |
| Account | Bank/wallet account | Bank A, Cash |
| Note | Optional description | Lunch |

## Portfolio Tab

| Column | Description | Example |
|--------|-------------|---------|
| Symbol | Stock/ETF ticker | 2330.TW, AAPL |
| Shares | Number of shares held | 100 |
| Cost | Total cost basis | 50000 |
| Price | Current price (GOOGLEFINANCE) | =GOOGLEFINANCE("2330.TW") |
| Value | Market value (auto) | =Shares × Price |
| P&L | Unrealized gain/loss (auto) | =Value - Cost |

## Customization

### Add a new category

1. Go to Settings tab
2. Add the category name to the Categories list
3. The dropdown in Transactions tab will auto-update

### Add a new account

1. Go to Settings tab
2. Add the account name to the Accounts list

### Change currency

1. Go to Settings tab
2. Update the Currency cell
3. All formatted values will update

## Important Notes

- Do NOT modify formula cells (grey background)
- P&L and Balance Sheet tabs are fully auto-calculated
- GOOGLEFINANCE updates with ~15 min delay
- The web dashboard reads data every 10 minutes (ISR 600s)
