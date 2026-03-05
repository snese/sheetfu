import { writeFileSync } from 'fs'
import path from 'path'
import {
  getTransactions, getPortfolio, getDashboardSummary,
  getHistory, getBalanceSheet, getInsurance, getMortgages,
} from '../lib/sheets/reader'
import { sheets, SHEET_ID } from '../lib/sheets/client'
import { SHEET_TABS } from '../lib/sheets/schema'

async function appendHistory(netWorth: number, totalAssets: number, totalLiabilities: number) {
  const history = await getHistory()
  const last = history[history.length - 1]
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
  if (last) {
    const diff = (new Date(today).getTime() - new Date(last.date).getTime()) / 86400000
    if (diff < 7) { console.log(`History skip: last record ${last.date}, ${Math.round(diff)}d ago`); return }
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TABS.history}!A:D`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[today, Math.round(totalAssets), Math.round(totalLiabilities), Math.round(netWorth)]] },
  })
  console.log(`History appended: ${today} netWorth=${Math.round(netWorth)}`)
}

async function main() {
  const [transactions, portfolio, dashboard, history, balanceSheet, insurance, mortgages] = await Promise.all([
    getTransactions(),
    getPortfolio(),
    getDashboardSummary(),
    getHistory(),
    getBalanceSheet(),
    getInsurance(),
    getMortgages(),
  ])
  const snapshot = { transactions, portfolio, dashboard, history, balanceSheet, insurance, mortgages, updatedAt: new Date().toISOString() }
  writeFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), JSON.stringify(snapshot, null, 2))
  console.log(`Snapshot written at ${snapshot.updatedAt}`)

  await appendHistory(dashboard.netWorth, dashboard.totalAssets, dashboard.totalLiabilities)

  // Trigger ISR revalidation so next start serves fresh data
  try {
    const res = await fetch('http://localhost:3000/api/revalidate', { method: 'POST' })
    console.log(`Revalidation: ${res.status}`)
  } catch (e) {
    console.warn('Revalidation failed (server may be down):', (e as Error).message)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
