'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { tooltipStyle } from '@/lib/chart-theme'

type ViewMode = 'all' | 'liquid' | 'realestate'

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'all', label: '全貌' },
  { key: 'liquid', label: '流動性' },
  { key: 'realestate', label: '不動產' },
]

export function NetWorthLine({ data, currentNetWorth }: { data: { date: string; totalAssets: number; totalLiabilities: number; netWorth: number }[]; currentNetWorth?: number }) {
  const [view, setView] = useState<ViewMode>('all')

  let chartData = data
  if (currentNetWorth != null && data.length > 0) {
    const last = data[data.length - 1]
    if (Math.abs(last.netWorth - currentNetWorth) > 1) {
      chartData = [...data.slice(0, -1), { ...last, netWorth: currentNetWorth }]
    }
  }
  if (chartData.length < 2) return <p className="text-xs text-muted-foreground text-center py-8">資料不足，至少需 2 筆歷史紀錄</p>

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
              view === v.key
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="reGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(38,85%,55%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(38,85%,55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis hide domain={['dataMin - 1000000', 'dataMax + 1000000']} />
          <Tooltip
            formatter={(v: number, name: string) => [`NT$${(v / 1e4).toFixed(0)}萬`, name]}
            {...tooltipStyle}
          />
          {view === 'all' && (
            <Area type="monotone" dataKey="netWorth" name="淨值" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
          )}
          {view === 'liquid' && (
            <Area type="monotone" dataKey={(d: Record<string, number>) => d.totalAssets - (d.totalAssets > d.netWorth + d.totalLiabilities ? 0 : 0)} name="流動性資產" stroke="hsl(152,55%,50%)" strokeWidth={2} fill="none" dot={false} />
          )}
          {view === 'liquid' && (
            <Area type="monotone" dataKey="netWorth" name="淨值" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
          )}
          {view === 'realestate' && (
            <Area type="monotone" dataKey="totalAssets" name="總資產" stroke="hsl(38,85%,55%)" strokeWidth={2} fill="url(#reGrad)" dot={false} />
          )}
          {view === 'realestate' && (
            <Area type="monotone" dataKey="totalLiabilities" name="總負債" stroke="hsl(0,70%,60%)" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
          )}
          {view === 'realestate' && (
            <Area type="monotone" dataKey="netWorth" name="淨值" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
