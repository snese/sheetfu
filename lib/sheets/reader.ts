import { sheets, SHEET_ID } from './client'
import {
  SHEET_RANGES,
  type Transaction,
  type PortfolioHolding,
  type BalanceSheetItem,
  type DashboardSummary,
} from './schema'

async function getRange(range: string): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  })
  return (res.data.values as string[][]) ?? []
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const rows = await getRange(SHEET_RANGES.transactions)
  const data = rows.map((r) => ({
    date: r[0] ?? '',
    market: r[1] as Transaction['market'],
    symbol: r[2] ?? '',
    name: r[3] ?? '',
    type: r[4] as Transaction['type'],
    shares: Number(r[5]) || 0,
    price: Number(r[6]) || 0,
    currency: r[7] ?? '',
    fxRate: Number(r[8]) || 0,
    fee: Number(r[9]) || 0,
    tax: Number(r[10]) || 0,
    totalTwd: Number(r[11]) || 0,
    note: r[12] ?? '',
  }))
  return limit ? data.slice(-limit) : data
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  const rows = await getRange(SHEET_RANGES.portfolio)
  return rows.map((r) => ({
    symbol: r[0] ?? '',
    name: r[1] ?? '',
    market: r[2] as PortfolioHolding['market'],
    shares: Number(r[3]) || 0,
    avgCost: Number(r[4]) || 0,
    currentPrice: Number(r[5]) || 0,
    currency: r[6] ?? '',
    fxRate: Number(r[7]) || 0,
    costTwd: Number(r[8]) || 0,
    valueTwd: Number(r[9]) || 0,
    pnlTwd: Number(r[10]) || 0,
    pnlPercent: Number(r[11]) || 0,
    weight: Number(r[12]) || 0,
    riskLevel: Number(r[13]) || 0,
    lastUpdate: r[14] ?? '',
  }))
}

export async function getBalanceSheet(): Promise<BalanceSheetItem[]> {
  const rows = await getRange(SHEET_RANGES.balanceSheet)
  return rows.map((r) => ({
    category: r[0] ?? '',
    item: r[1] ?? '',
    currency: r[2] ?? '',
    amount: Number(r[3]) || 0,
    amountTwd: Number(r[4]) || 0,
    note: r[5] ?? '',
    lastUpdate: r[6] ?? '',
  }))
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const rows = await getRange(SHEET_RANGES.overview)
  const kv = Object.fromEntries(rows.map((r) => [r[0], r[1]]))
  return {
    netWorth: Number(kv['淨值'] ?? kv['Net Worth']) || 0,
    totalInvestment: Number(kv['投資市值'] ?? kv['Total Investment']) || 0,
    totalCost: Number(kv['投資成本'] ?? kv['Total Cost']) || 0,
    totalPnl: Number(kv['未實現損益'] ?? kv['Total P&L']) || 0,
    returnPercent: Number(kv['報酬率'] ?? kv['Return %']) || 0,
    riskScore: Number(kv['風險分數'] ?? kv['Risk Score']) || 0,
    baseCurrency: kv['基礎貨幣'] ?? kv['Base Currency'] ?? 'TWD',
  }
}
