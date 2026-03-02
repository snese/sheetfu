import { formatCurrency, formatPercent, formatPnl } from '@/lib/utils'
import { getDashboardSummary, getPortfolio, getTransactions } from '@/lib/sheets/reader'
import type { DashboardSummary, PortfolioHolding, Transaction } from '@/lib/sheets/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function Home() {
  const [d, topHoldings, recentTx] = await (async () => {
    try {
      const [dashboard, portfolio, transactions] = await Promise.all([
        getDashboardSummary(),
        getPortfolio(),
        getTransactions(5),
      ])
      return [
        dashboard,
        [...portfolio].sort((a, b) => b.valueTwd - a.valueTwd).slice(0, 5),
        transactions,
      ] as const
    } catch {
      return [null, [] as PortfolioHolding[], [] as Transaction[]] as const
    }
  })()

  if (!d) return <div className="text-center py-12 text-muted-foreground">無法載入資料，請確認 .env.local 設定</div>

  const pnl = formatPnl(d.totalPnl)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">淨值 Net Worth</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(d.netWorth)}</p>
        <p className={`text-sm mt-1 ${pnl.color}`}>
          {pnl.arrow} {pnl.text} ({formatPercent(d.returnPercent)})
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">前 5 大持倉</h2>
        <div className="space-y-2">
          {topHoldings.map((h) => {
            const hp = formatPnl(h.pnlTwd)
            return (
              <div key={h.symbol} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{h.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">{h.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatCurrency(h.valueTwd)}</p>
                  <p className={`text-xs ${hp.color}`}>{hp.arrow} {formatPercent(h.pnlPercent)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">最近交易</h2>
        <div className="space-y-2">
          {recentTx.map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-xs text-muted-foreground mr-2">{tx.date}</span>
                <span className={tx.type === 'buy' ? 'text-green-500' : tx.type === 'sell' ? 'text-red-500' : ''}>
                  {tx.type === 'buy' ? '買' : tx.type === 'sell' ? '賣' : tx.type === 'dividend' ? '股利' : tx.type}
                </span>
              </div>
              <div className="text-right">
                <span className="font-medium">{tx.symbol}</span>
                <span className="text-muted-foreground ml-2">×{tx.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
