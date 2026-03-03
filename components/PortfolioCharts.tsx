'use client'
import dynamic from 'next/dynamic'
import { formatCurrency } from '@/lib/utils'
import type { RiskBucket } from '@/lib/sheets/schema'

const RiskBar = dynamic(() => import('@/components/charts/RiskBar').then(m => ({ default: m.RiskBar })), { ssr: false })

export function PortfolioCharts({ marketDistribution, riskDistribution, riskScore, totalInvestment }: {
  marketDistribution: { market: string; valueTwd: number }[]
  riskDistribution: RiskBucket[]
  riskScore: number
  totalInvestment: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">市場分布</p>
        <div className="space-y-2.5">
          {marketDistribution.map(m => (
            <div key={m.market}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.market === 'US' ? '🇺🇸 美股' : m.market === 'TW' ? '🇹🇼 台股' : m.market}</span>
                <span className="font-medium">{formatCurrency(m.valueTwd)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${Math.min((m.valueTwd / totalInvestment) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">風險分布 · {riskScore.toFixed(1)}</p>
        {riskDistribution.length > 0
          ? <RiskBar data={riskDistribution} />
          : <p className="text-xs text-muted-foreground text-center py-8">無資料</p>}
      </div>
    </div>
  )
}
