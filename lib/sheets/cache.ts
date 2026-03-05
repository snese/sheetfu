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

let cachedSnapshot: Snapshot | null = null
let cachedAt = 0
const SNAPSHOT_TTL = 30_000

function loadSnapshot(): Snapshot {
  if (cachedSnapshot && Date.now() - cachedAt < SNAPSHOT_TTL) return cachedSnapshot
  const raw = readFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), 'utf-8')
  cachedSnapshot = JSON.parse(raw) as Snapshot
  cachedAt = Date.now()
  return cachedSnapshot
}

type CacheResult<T> = { data: T; stale: false } | { data: T; stale: true; updatedAt: string }

async function withFallback<T>(liveFn: () => Promise<T>, snapshotKey: keyof Snapshot): Promise<CacheResult<T>> {
  try {
    const data = await liveFn()
    return { data, stale: false }
  } catch (e) {
    console.warn(`[cache] live read failed for ${snapshotKey}, falling back to snapshot:`, (e as Error).message)
    try {
      const snap = loadSnapshot()
      return { data: snap[snapshotKey] as T, stale: true, updatedAt: snap.updatedAt }
    } catch {
      throw new Error(`Both live read and snapshot fallback failed for ${snapshotKey}`)
    }
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
