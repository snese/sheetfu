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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">持倉明細 Portfolio</h1>
      {Object.entries(grouped).map(([market, items]) => (
        <div key={market}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">{market}</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <th className="text-left p-2">標的</th>
                  <th className="text-right p-2">股數</th>
                  <th className="text-right p-2">現價</th>
                  <th className="text-right p-2">市值</th>
                  <th className="text-right p-2">損益</th>
                </tr>
              </thead>
              <tbody>
                {items.sort((a, b) => b.valueTwd - a.valueTwd).map((h) => {
                  const p = formatPnl(h.pnlTwd)
                  return (
                    <tr key={h.symbol} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <div className="font-medium">{h.symbol}</div>
                        <div className="text-xs text-muted-foreground">{h.name}</div>
                      </td>
                      <td className="text-right p-2">{h.shares.toLocaleString()}</td>
                      <td className="text-right p-2">{h.currentPrice.toLocaleString()}</td>
                      <td className="text-right p-2">{formatCurrency(h.valueTwd)}</td>
                      <td className={`text-right p-2 ${p.color}`}>
                        {p.arrow} {formatPercent(h.pnlPercent)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
