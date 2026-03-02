import { getDashboardSummary, getPortfolio, getTransactions, getHistory } from '@/lib/sheets/reader'
import { RefreshButton } from '@/components/RefreshButton'
import { DashboardClient } from '@/components/DashboardClient'
import type { PortfolioHolding, Transaction, HistoryPoint } from '@/lib/sheets/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function Home() {
  try {
    const [d, portfolio, transactions, history] = await Promise.all([
      getDashboardSummary(),
      getPortfolio(),
      getTransactions(5),
      getHistory(),
    ])
    const topHoldings = [...portfolio].sort((a, b) => b.valueTwd - a.valueTwd).slice(0, 5)
    return (
      <div className="space-y-5">
        <div className="flex justify-end"><RefreshButton /></div>
        <DashboardClient d={d} topHoldings={topHoldings} recentTx={transactions} history={history} />
      </div>
    )
  } catch {
    return <div className="text-center py-12 text-muted-foreground">無法載入資料，請確認 .env.local 設定</div>
  }
}
