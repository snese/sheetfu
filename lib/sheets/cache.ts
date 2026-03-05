import { readFileSync } from 'fs'
import path from 'path'
import * as reader from './reader'
import type {
  Transaction, PortfolioHolding, DashboardSummary,
  BalanceSheetItem, HistoryPoint, InsurancePolicy, Mortgage,
} from './schema'

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

function loadSnapshot(): Snapshot {
  const raw = readFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), 'utf-8')
  return JSON.parse(raw) as Snapshot
}

type CacheResult<T> = { data: T; stale: false } | { data: T; stale: true; updatedAt: string }

async function withFallback<T>(liveFn: () => Promise<T>, snapshotKey: keyof Snapshot): Promise<CacheResult<T>> {
  try {
    const data = await liveFn()
    return { data, stale: false }
  } catch (e) {
    console.warn(`[cache] live read failed for ${snapshotKey}, falling back to snapshot:`, (e as Error).message)
    const snap = loadSnapshot()
    return { data: snap[snapshotKey] as T, stale: true, updatedAt: snap.updatedAt }
  }
}

export function getDashboard() {
  return withFallback<DashboardSummary>(reader.getDashboardSummary, 'dashboard')
}

export function getPortfolio() {
  return withFallback<PortfolioHolding[]>(reader.getPortfolio, 'portfolio')
}

export function getTransactions(limit?: number) {
  return withFallback<Transaction[]>(() => reader.getTransactions(limit), 'transactions')
}

export function getBalanceSheet() {
  return withFallback<BalanceSheetItem[]>(reader.getBalanceSheet, 'balanceSheet')
}

export function getHistory() {
  return withFallback<HistoryPoint[]>(reader.getHistory, 'history')
}

export function getInsurance() {
  return withFallback<InsurancePolicy[]>(reader.getInsurance, 'insurance')
}

export function getMortgages() {
  return withFallback<Mortgage[]>(reader.getMortgages, 'mortgages')
}
