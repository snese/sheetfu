import { writeFileSync } from 'fs'
import path from 'path'
import { getTransactions, getPortfolio, getDashboardSummary, getHistory } from '../lib/sheets/reader'
import { sheets, SHEET_ID } from '../lib/sheets/client'
import { SHEET_TABS } from '../lib/sheets/schema'

async function appendHistory(netWorth: number, totalAssets: number, totalLiabilities: number) {
  const history = await getHistory()
  const last = history[history.length - 1]
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
  // Skip if last record is within 7 days
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
  const [transactions, portfolio, dashboard] = await Promise.all([
    getTransactions(),
    getPortfolio(),
    getDashboardSummary(),
  ])
  const snapshot = { transactions, portfolio, dashboard, updatedAt: new Date().toISOString() }
  writeFileSync(path.join(process.cwd(), 'public', 'snapshot.json'), JSON.stringify(snapshot, null, 2))
  console.log(`Snapshot written at ${snapshot.updatedAt}`)

  await appendHistory(dashboard.netWorth, dashboard.totalAssets, dashboard.totalLiabilities)
}

main().catch((e) => { console.error(e); process.exit(1) })
