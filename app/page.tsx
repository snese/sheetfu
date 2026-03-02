import { formatCurrency, formatPercent, formatPnl } from '@/lib/utils'
import { getDashboardSummary, getPortfolio, getTransactions } from '@/lib/sheets/reader'
import { RefreshButton } from '@/components/RefreshButton'
import type { PortfolioHolding, Transaction } from '@/lib/sheets/schema'

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

  const totalInvPnl = topHoldings.reduce((s, h) => s + h.pnlTwd, 0)
  const totalInvCost = topHoldings.reduce((s, h) => s + h.costTwd, 0)
  const pnlPct = totalInvCost > 0 ? totalInvPnl / totalInvCost : 0
  const pnl = formatPnl(totalInvPnl)

  return (
    <div className="space-y-5">
      {/* Net Worth Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">家庭總淨值</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{formatCurrency(d.netWorth)}</p>
            <p className={`text-sm mt-1.5 font-medium ${pnl.color}`}>
              {pnl.arrow} {pnl.text} ({formatPercent(pnlPct)})
            </p>
          </div>
          <RefreshButton />
        </div>
      </div>

      {/* Asset Composition + Market Distribution */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">資產組成</p>
          <div className="space-y-2.5">
            {[
              { label: '投資', value: d.investment, color: 'bg-accent' },
              { label: '現金', value: d.cash, color: 'bg-emerald-500' },
              { label: '不動產', value: d.realEstate, color: 'bg-amber-500' },
            ].filter(i => i.value > 0).map(i => (
              <div key={i.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{i.label}</span>
                  <span className="font-medium">{formatCurrency(i.value)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${i.color}`} style={{ width: `${Math.min((i.value / d.totalAssets) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">市場分布</p>
          <div className="space-y-2.5">
            {d.marketDistribution.map(m => (
              <div key={m.market}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{m.market === 'US' ? '🇺🇸 美股' : m.market === 'TW' ? '🇹🇼 台股' : m.market}</span>
                  <span className="font-medium">{formatCurrency(m.valueTwd)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min((m.valueTwd / d.investment) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-medium text-muted-foreground mb-3">前 5 大持倉</h2>
        <div className="space-y-3">
          {topHoldings.map((h) => {
            const hp = formatPnl(h.pnlTwd)
            const weight = h.totalPortfolio > 0 ? (h.valueTwd / h.totalPortfolio) * 100 : 0
            return (
              <div key={h.symbol} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{h.market}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{h.symbol}</span>
                    <span className="text-xs text-muted-foreground">{h.assetType}</span>
                    {weight > 0 && <span className="text-[10px] text-muted-foreground">{weight.toFixed(1)}%</span>}
                  </div>
                  <div className="h-1 rounded-full bg-muted mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${h.pnlTwd >= 0 ? 'bg-profit' : 'bg-loss'}`} style={{ width: `${Math.min(Math.abs(h.pnlPercent < 1 ? h.pnlPercent * 100 : h.pnlPercent) + 50, 100)}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">{formatCurrency(h.valueTwd)}</p>
                  <p className={`text-xs font-medium ${hp.color}`}>{hp.arrow} {formatPercent(h.pnlPercent)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-medium text-muted-foreground mb-3">最近交易</h2>
        <div className="space-y-2">
          {recentTx.map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  tx.type === '買入' ? 'bg-profit/10 text-profit' :
                  tx.type === '賣出' ? 'bg-loss/10 text-loss' :
                  'bg-accent/10 text-accent'
                }`}>{tx.type}</span>
                <span className="text-xs text-muted-foreground">{tx.date}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{tx.symbol}</span>
                <span className="text-muted-foreground ml-1.5 text-xs">×{tx.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
