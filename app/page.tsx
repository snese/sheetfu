import { getDashboardSummary, getPortfolio, getTransactions, getHistory, getMortgages } from '@/lib/sheets/reader'
import { DashboardClient } from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function Home() {
  try {
    const [d, portfolio, transactions, history, mortgages] = await Promise.all([
      getDashboardSummary(),
      getPortfolio(),
      getTransactions(5),
      getHistory(),
      getMortgages(),
    ])
    const topHoldings = [...portfolio].sort((a, b) => b.valueTwd - a.valueTwd).slice(0, 5)
    return <DashboardClient d={d} topHoldings={topHoldings} recentTx={transactions} history={history} mortgages={mortgages} />
  } catch {
    return <div className="text-center py-12 text-muted-foreground">無法載入資料，請確認 .env.local 設定</div>
  }
}
