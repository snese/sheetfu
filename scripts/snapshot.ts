import { writeFileSync } from 'fs'
import path from 'path'
import { getTransactions, getPortfolio, getBalanceSheet, getDashboardSummary } from '../lib/sheets/reader'

async function main() {
  const [transactions, portfolio, balance, dashboard] = await Promise.all([
    getTransactions(),
    getPortfolio(),
    getBalanceSheet(),
    getDashboardSummary(),
  ])
  const snapshot = { transactions, portfolio, balance, dashboard, updatedAt: new Date().toISOString() }
  writeFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), JSON.stringify(snapshot, null, 2))
  console.log(`Snapshot written at ${snapshot.updatedAt}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
