'use client'
import dynamic from 'next/dynamic'
import { CountUp } from '@/components/charts/CountUp'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/charts/Animate'
import { formatCurrency, formatPercent, formatPnl } from '@/lib/utils'
import type { DashboardSummary, PortfolioHolding, Transaction, HistoryPoint } from '@/lib/sheets/schema'

const MiniPie = dynamic(() => import('@/components/charts/MiniPie').then(m => ({ default: m.MiniPie })), { ssr: false })
const RiskBar = dynamic(() => import('@/components/charts/RiskBar').then(m => ({ default: m.RiskBar })), { ssr: false })
const NetWorthLine = dynamic(() => import('@/components/charts/NetWorthLine').then(m => ({ default: m.NetWorthLine })), { ssr: false })

export function DashboardClient({ d, topHoldings, recentTx, history }: {
  d: DashboardSummary
  topHoldings: PortfolioHolding[]
  recentTx: Transaction[]
  history: HistoryPoint[]
}) {
  const pnl = formatPnl(d.performance.totalPnl)
  const assetPieData = [
    { name: '投資', value: d.investment },
    { name: '現金', value: d.cash },
    ...(d.realEstate > 0 ? [{ name: '不動產', value: d.realEstate }] : []),
  ]

  return (
    <StaggerContainer className="space-y-5">
      {/* Net Worth Hero */}
      <StaggerItem>
        <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-border p-6">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">家庭總淨值</p>
          <p className="text-3xl font-bold tracking-tight mt-1">
            <CountUp value={d.netWorth} prefix="NT$" />
          </p>
          <p className={`text-sm mt-1.5 font-medium ${pnl.color}`}>
            {pnl.arrow} {pnl.text} ({formatPercent(d.performance.returnPercent / 100)})
          </p>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>總成本 {formatCurrency(d.performance.totalCost)}</span>
            <span>風險分數 {d.riskScore.toFixed(1)}</span>
          </div>
        </div>
      </StaggerItem>

      {/* Charts Row: Asset Pie + Risk Bar */}
      <div className="grid grid-cols-2 gap-3">
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">資產組成</p>
            <MiniPie data={assetPieData} />
            <div className="flex justify-center gap-3 text-[10px] text-muted-foreground mt-1">
              {assetPieData.map(i => (
                <span key={i.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: i.name === '投資' ? 'hsl(220,70%,50%)' : i.name === '現金' ? 'hsl(152,60%,40%)' : 'hsl(38,92%,50%)' }} />
                  {i.name}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">風險分布</p>
            {d.riskDistribution.length > 0
              ? <RiskBar data={d.riskDistribution} />
              : <p className="text-xs text-muted-foreground text-center py-8">無資料</p>}
          </div>
        </StaggerItem>
      </div>

      {/* Market Distribution */}
      <StaggerItem>
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
                  <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${Math.min((m.valueTwd / d.investment) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </StaggerItem>

      {/* Net Worth Trend */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">淨值趋勢</p>
          <NetWorthLine data={history} />
        </div>
      </StaggerItem>

      {/* Top Holdings */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">前 5 大持倉</p>
          <div className="space-y-3">
            {topHoldings.map((h) => {
              const hp = formatPnl(h.pnlTwd)
              const weight = h.totalPortfolio > 0 ? (h.valueTwd / h.totalPortfolio) * 100 : 0
              return (
                <FadeIn key={h.symbol}>
                  <div className="flex items-center gap-3">
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
                        <div className={`h-full rounded-full transition-all duration-700 ${h.pnlTwd >= 0 ? 'bg-profit' : 'bg-loss'}`} style={{ width: `${Math.min(weight * 2, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{formatCurrency(h.valueTwd)}</p>
                      <p className={`text-xs font-medium ${hp.color}`}>{hp.arrow} {formatPercent(h.pnlPercent)}</p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </StaggerItem>

      {/* Recent Transactions */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">最近交易</p>
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
      </StaggerItem>
    </StaggerContainer>
  )
}
