import { sheets, SHEET_ID } from './client'
import {
  SHEET_RANGES,
  type Transaction,
  type PortfolioHolding,
  type DashboardSummary,
  type BalanceSheetItem,
  type HistoryPoint,
  type InsurancePolicy,
  type Mortgage,
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
  return Number(String(s).replace(/[NT$,\s]/g, '').replace(/^-/, '')) * (String(s).includes('-') ? -1 : 1) || 0
}

function pctToNum(s: string): number {
  if (!s) return 0
  return parseFloat(String(s).replace('%', '')) || 0
}

function parseDate(s: string): number {
  if (!s) return 0
  return new Date(s.replace(/\//g, '-')).getTime() || 0
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const rows = await getRange(SHEET_RANGES.transactions)
  const data = rows.map((r) => ({
    date: r[0] ?? '', broker: r[1] ?? '', symbol: r[2] ?? '',
    market: (r[3] ?? 'US') as Transaction['market'],
    assetType: r[4] ?? '', type: r[5] ?? '',
    shares: Number(r[6]) || 0, price: Number(r[7]) || 0,
    currency: r[8] ?? '', totalCost: Number(r[9]) || 0,
    fee: Number(r[10]) || 0, fxRate: Number(r[11]) || 0, note: r[12] ?? '',
  }))
  data.sort((a, b) => parseDate(b.date) - parseDate(a.date))
  return limit ? data.slice(0, limit) : data
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  const rows = await getRange(SHEET_RANGES.portfolio)
  return rows.filter(r => r[0] && r[0].trim()).map((r) => ({
    symbol: r[0] ?? '', market: (r[1] ?? 'US') as PortfolioHolding['market'],
    assetType: r[2] ?? '', currency: r[3] ?? '',
    shares: Number(r[4]) || 0, currentPrice: Number(r[5]) || 0,
    valueLocal: Number(r[6]) || 0, fxRate: Number(r[7]) || 0,
    valueTwd: Number(r[8]) || 0, avgCost: Number(r[9]) || 0,
    costTwd: Number(r[10]) || 0, pnlTwd: Number(r[11]) || 0,
    pnlPercent: Number(r[12]) || 0, riskLevel: r[13] ?? '',
    totalPortfolio: Number(r[14]) || 0,
  }))
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const rows = await getRange(SHEET_RANGES.overview)
  const kv: Record<string, string> = {}
  const marketDist: DashboardSummary['marketDistribution'] = []
  const riskDist: DashboardSummary['riskDistribution'] = []
  let section = ''

  for (const r of rows) {
    const key = (r[0] ?? '').trim()
    const val = (r[1] ?? '').trim()
    if (!key) continue
    if (key.match(/[\u{2600}-\u{2BFF}\u{1F300}-\u{1FAFF}]/u) || key === '項目') {
      if (key.includes('市場分布')) section = 'market'
      else if (key.includes('風險分布')) section = 'risk'
      else if (key.includes('資產組成')) section = 'asset'
      else if (key.includes('投資績效')) section = 'perf'
      else section = 'summary'
      continue
    }
    if (section === 'market') marketDist.push({ market: key, valueTwd: parseTwd(val) })
    else if (section === 'risk' && key !== '風險分數') riskDist.push({ level: key, valueTwd: parseTwd(val) })
    else kv[key] = val
  }

  return {
    netWorth: parseTwd(kv['家庭總淨值'] ?? '0'),
    totalAssets: parseTwd(kv['總資產'] ?? '0'),
    totalLiabilities: parseTwd(kv['總負債'] ?? '0'),
    cash: parseTwd(kv['現金'] ?? '0'),
    investment: parseTwd(kv['投資'] ?? '0'),
    realEstate: parseTwd(kv['不動產'] ?? '0'),
    marketDistribution: marketDist,
    riskDistribution: riskDist,
    riskScore: parseFloat(kv['風險分數'] ?? '0') || 0,
    performance: {
      totalValue: parseTwd(kv['持股市值'] ?? '0'),
      totalCost: parseTwd(kv['總成本'] ?? '0'),
      totalPnl: parseTwd(kv['未實現損益'] ?? '0'),
      returnPercent: pctToNum(kv['總報酬率'] ?? '0'),
    },
  }
}

export async function getBalanceSheet(): Promise<BalanceSheetItem[]> {
  const rows = await getRange(SHEET_RANGES.balanceSheet)
  return rows.slice(1)
    .filter(r => r[0] && !['資產', '負債'].includes(r[0]) && !r[0].includes('總'))
    .filter(r => r[1])
    .map(r => ({
      category: r[0] ?? '', subCategory: r[1] ?? '', description: r[2] ?? '',
      currency: r[3] ?? 'TWD', amountLocal: Number(r[4]) || 0,
      amountTwd: Number(r[5]) || 0, lastUpdate: r[6] ?? '', note: r[7] ?? '',
    }))
}

export async function getHistory(): Promise<HistoryPoint[]> {
  const rows = await getRange(SHEET_RANGES.history)
  const header = rows[0] ?? []
  const assetIdx = header.findIndex(h => /total.*asset|總資產/i.test(h))
  const liabIdx = header.findIndex(h => /total.*liab|總負債/i.test(h))
  const ai = assetIdx >= 0 ? assetIdx : 1
  const li = liabIdx >= 0 ? liabIdx : 2
  return rows.slice(1).filter(r => r[0]).map(r => ({
    date: r[0] ?? '',
    totalAssets: Number(r[ai]) || 0,
    totalLiabilities: Number(r[li]) || 0,
    netWorth: (Number(r[ai]) || 0) - (Number(r[li]) || 0),
  }))
}

export async function getInsurance(): Promise<InsurancePolicy[]> {
  const rows = await getRange(SHEET_RANGES.insurance)
  return rows.filter(r => r[0]).map(r => ({
    insured: r[0] ?? '', company: r[1] ?? '', policyName: r[2] ?? '',
    coverage: r[3] ?? '', amount: r[4] ?? '',
    annualPremium: Number(r[5]) || 0, cycle: r[6] ?? '',
    paymentMethod: r[7] ?? '', startDate: r[8] ?? '',
    endDate: r[9] ?? '', nextPayment: r[10] ?? '', note: r[11] ?? '',
  }))
}

export async function getMortgages(): Promise<Mortgage[]> {
  const rows = await getRange(SHEET_RANGES.mortgage)
  return rows.filter(r => r[0]).map(r => ({
    name: r[0] ?? '', bank: r[1] ?? '',
    principal: Number(r[2]) || 0, rate: Number(r[3]) || 0,
    termMonths: Number(r[4]) || 0, startDate: r[5] ?? '',
    gracePeriodMonths: Number(r[6]) || 0,
    monthlyPayment: Number(r[7]) || 0, paidPeriods: Number(r[8]) || 0,
    paidPrincipal: Number(r[9]) || 0, remainingPrincipal: Number(r[10]) || 0,
  }))
}
