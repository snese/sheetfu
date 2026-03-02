import { formatCurrency, formatPercent, formatPnl } from '@/lib/utils'
import { getPortfolio } from '@/lib/sheets/reader'
import type { PortfolioHolding } from '@/lib/sheets/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function PortfolioPage() {
  let holdings: PortfolioHolding[] = []
  try {
    holdings = await getPortfolio()
  } catch {
    return <div className="text-center py-12 text-muted-foreground">無法載入持倉資料</div>
  }

  const grouped = holdings.reduce<Record<string, PortfolioHolding[]>>((acc, h) => {
    const key = h.market || 'Other'
    ;(acc[key] ??= []).push(h)
    return acc
  }, {})

  const totalValue = holdings.reduce((s, h) => s + h.valueTwd, 0)
  const totalPnl = holdings.reduce((s, h) => s + h.pnlTwd, 0)
  const totalCost = holdings.reduce((s, h) => s + h.costTwd, 0)
  const overallPnl = formatPnl(totalPnl)

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">總市值</p>
            <p className="text-lg font-bold mt-0.5">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">總成本</p>
            <p className="text-lg font-bold mt-0.5">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">未實現損益</p>
            <p className={`text-lg font-bold mt-0.5 ${overallPnl.color}`}>{overallPnl.arrow} {formatPercent(totalCost > 0 ? totalPnl / totalCost : 0)}</p>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([market, items]) => {
        const marketLabel = market === 'US' ? '🇺🇸 美股' : market === 'TW' ? '🇹🇼 台股' : market
        return (
          <div key={market}>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">{marketLabel}</h2>
            <div className="space-y-2">
              {items.sort((a, b) => b.valueTwd - a.valueTwd).map((h) => {
                const p = formatPnl(h.pnlTwd)
                const weight = totalValue > 0 ? (h.valueTwd / totalValue) * 100 : 0
                return (
                  <div key={h.symbol} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-accent">{h.assetType.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-sm">{h.symbol}</span>
                            <span className="text-[10px] text-muted-foreground">{h.currency} · {h.riskLevel}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {h.shares.toLocaleString()} 股 · 均價 {h.avgCost.toLocaleString()} · 現價 {h.currentPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(h.valueTwd)}</p>
                        <p className={`text-xs font-medium ${p.color}`}>{p.arrow} {formatCurrency(h.pnlTwd)} ({formatPercent(h.pnlPercent)})</p>
                      </div>
                    </div>
                    {/* Weight bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${h.pnlTwd >= 0 ? 'bg-profit' : 'bg-loss'}`} style={{ width: `${Math.min(weight * 2, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{weight.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
