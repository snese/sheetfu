'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { CountUp } from '@/components/charts/CountUp'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/charts/Animate'
import { formatCurrency, formatPercent, formatPnl } from '@/lib/utils'
import type { DashboardSummary, PortfolioHolding, Transaction, HistoryPoint, Mortgage } from '@/lib/sheets/schema'

const MiniPie = dynamic(() => import('@/components/charts/MiniPie').then(m => ({ default: m.MiniPie })), { ssr: false })
const NetWorthLine = dynamic(() => import('@/components/charts/NetWorthLine').then(m => ({ default: m.NetWorthLine })), { ssr: false })

const ASSET_COLORS = {
  '不動產': 'hsl(38,85%,55%)',
  '投資': 'hsl(220,70%,60%)',
  '現金': 'hsl(152,55%,50%)',
} as const

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between mb-2 group">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <span className="text-[10px] text-muted-foreground group-hover:text-accent transition-colors">查看 →</span>
    </Link>
  )
}

export function DashboardClient({ d, topHoldings, recentTx, history, mortgages }: {
  d: DashboardSummary
  topHoldings: PortfolioHolding[]
  recentTx: Transaction[]
  history: HistoryPoint[]
  mortgages: Mortgage[]
}) {
  const pnl = formatPnl(d.performance.totalPnl)
  const assetPieData = [
    ...(d.realEstate > 0 ? [{ name: '不動產', value: d.realEstate }] : []),
    { name: '投資', value: d.investment },
    { name: '現金', value: d.cash },
  ]
  const pieColors = assetPieData.map(i => ASSET_COLORS[i.name as keyof typeof ASSET_COLORS] ?? 'hsl(280,55%,60%)')
  const totalMortgageMonthly = mortgages.reduce((s, m) => s + m.monthlyPayment, 0)

  return (
    <StaggerContainer className="space-y-5">
      {/* Net Worth Hero */}
      <StaggerItem>
        <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-border p-6">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">家庭總淨值</p>
          <p className="text-3xl font-bold tracking-tight mt-1">
            <CountUp value={d.netWorth} prefix="NT$" />
          </p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>資產 {formatCurrency(d.totalAssets)}</span>
            <span>負債 {formatCurrency(d.totalLiabilities)}</span>
          </div>
          <p className={`text-sm mt-2 font-medium ${pnl.color}`}>
            投資損益 {pnl.arrow} {pnl.text} ({formatPercent(d.performance.returnPercent / 100)})
          </p>
        </div>
      </StaggerItem>

      {/* Asset Composition */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <SectionLink href="/assets" label="資產組成" />
          <MiniPie data={assetPieData} colors={pieColors} />
          <div className="flex justify-center gap-3 text-[10px] text-muted-foreground mt-1">
            {assetPieData.map((item, i) => (
              <span key={item.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: pieColors[i] }} />
                {item.name} {((item.value / d.totalAssets) * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      </StaggerItem>

      {/* Mortgage Summary */}
      {mortgages.length > 0 && (
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-4">
            <SectionLink href="/assets" label="房貸概況" />
            <div className="space-y-3">
              {mortgages.map((m) => {
                const paidPct = m.principal > 0 ? (m.paidPrincipal / m.principal) * 100 : 0
                return (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(m.remainingPrincipal)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${paidPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>已還 {paidPct.toFixed(1)}%</span>
                      <span>月付 {formatCurrency(m.monthlyPayment)}</span>
                    </div>
                  </div>
                )
              })}
              {mortgages.length > 1 && (
                <div className="pt-2 border-t border-border flex justify-between text-xs">
                  <span className="text-muted-foreground">合計月付</span>
                  <span className="font-medium">{formatCurrency(totalMortgageMonthly)}</span>
                </div>
              )}
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Net Worth Trend */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">淨值趨勢</p>
          <NetWorthLine data={history} currentNetWorth={d.netWorth} />
        </div>
      </StaggerItem>

      {/* Top Holdings */}
      <StaggerItem>
        <div className="rounded-xl border border-border bg-card p-4">
          <SectionLink href="/portfolio" label="前 5 大持倉" />
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
          <p className="text-xs font-medium text-muted-foreground mb-2">最近交易</p>
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
