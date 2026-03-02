import { sheets, SHEET_ID } from './client'
import {
  SHEET_RANGES,
  type Transaction,
  type PortfolioHolding,
  type DashboardSummary,
} from './schema'

const cache = new Map<string, { data: string[][]; ts: number }>()
const TTL = 5 * 60 * 1000

async function getRange(range: string): Promise<string[][]> {
  const cached = cache.get(range)
  if (cached && Date.now() - cached.ts < TTL) return cached.data
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
  const data = (res.data.values as string[][]) ?? []
  cache.set(range, { data, ts: Date.now() })
  return data
}

export function invalidateCache() { cache.clear() }

function parseTwd(s: string): number {
  if (!s) return 0
  return Number(String(s).replace(/[NT$,\s]/g, '')) || 0
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const rows = await getRange(SHEET_RANGES.transactions)
  const data = rows.map((r) => ({
    date: r[0] ?? '',
    broker: r[1] ?? '',
    symbol: r[2] ?? '',
    market: (r[3] ?? 'US') as Transaction['market'],
    assetType: r[4] ?? '',
    type: r[5] ?? '',
    shares: Number(r[6]) || 0,
    price: Number(r[7]) || 0,
    currency: r[8] ?? '',
    totalCost: Number(r[9]) || 0,
    fee: Number(r[10]) || 0,
    fxRate: Number(r[11]) || 0,
    note: r[12] ?? '',
  }))
  return limit ? data.slice(-limit) : data
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  const rows = await getRange(SHEET_RANGES.portfolio)
  return rows.filter(r => r[0] && r[0].trim()).map((r) => ({
    symbol: r[0] ?? '',
    market: (r[1] ?? 'US') as PortfolioHolding['market'],
    assetType: r[2] ?? '',
    currency: r[3] ?? '',
    shares: Number(r[4]) || 0,
    currentPrice: Number(r[5]) || 0,
    valueLocal: Number(r[6]) || 0,
    fxRate: Number(r[7]) || 0,
    valueTwd: Number(r[8]) || 0,
    avgCost: Number(r[9]) || 0,
    costTwd: Number(r[10]) || 0,
    pnlTwd: Number(r[11]) || 0,
    pnlPercent: Number(r[12]) || 0,
    riskLevel: r[13] ?? '',
    totalPortfolio: Number(r[14]) || 0,
  }))
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const rows = await getRange(SHEET_RANGES.overview)
  // Parse grouped table: find key-value pairs, skip emoji headers and empty rows
  const kv: Record<string, string> = {}
  const marketDist: { market: string; valueTwd: number }[] = []
  let section = ''

  for (const r of rows) {
    const key = (r[0] ?? '').trim()
    const val = (r[1] ?? '').trim()
    if (!key) continue
    // Detect section headers (emoji prefixed or header rows)
    if (key.match(/^[📊💰🌍]/) || key === '項目') {
      if (key.includes('市場分布')) section = 'market'
      else if (key.includes('資產組成')) section = 'asset'
      else section = 'summary'
      continue
    }
    if (section === 'market' && key !== '市值(台幣)') {
      marketDist.push({ market: key, valueTwd: parseTwd(val) })
    } else {
      kv[key] = val
    }
  }

  return {
    netWorth: parseTwd(kv['家庭總淨值'] ?? '0'),
    totalAssets: parseTwd(kv['總資產'] ?? '0'),
    totalLiabilities: parseTwd(kv['總負債'] ?? '0'),
    cash: parseTwd(kv['現金'] ?? '0'),
    investment: parseTwd(kv['投資'] ?? '0'),
    realEstate: parseTwd(kv['不動產'] ?? '0'),
    marketDistribution: marketDist,
  }
}
