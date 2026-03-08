import { readFileSync } from 'fs'
import path from 'path'
import type {
  Transaction, PortfolioHolding, DashboardSummary,
  BalanceSheetItem, HistoryPoint, InsurancePolicy, Mortgage,
} from './sheets/schema'

interface Snapshot {
  transactions: Transaction[]
  portfolio: PortfolioHolding[]
  dashboard: DashboardSummary
  history: HistoryPoint[]
  balanceSheet: BalanceSheetItem[]
  insurance: InsurancePolicy[]
  mortgages: Mortgage[]
  updatedAt: string
}

let cached: Snapshot | null = null
let cachedTs = 0
const TTL = 30_000 // re-read file at most every 30s

function load(): Snapshot {
  if (cached && Date.now() - cachedTs < TTL) return cached
  const raw = readFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), 'utf-8')
  cached = JSON.parse(raw) as Snapshot
  cachedTs = Date.now()
  return cached
}

export function getSnapshotUpdatedAt() { return load().updatedAt }
export function getTransactions(limit?: number) { const t = load().transactions; return limit ? t.slice(0, limit) : t }
export function getPortfolio() { return load().portfolio }
export function getDashboardSummary() { return load().dashboard }
export function getHistory() { return load().history }
export function getBalanceSheet() { return load().balanceSheet }
export function getInsurance() { return load().insurance }
export function getMortgages() { return load().mortgages }
