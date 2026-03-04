'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { tooltipStyle } from '@/lib/chart-theme'

export function NetWorthLine({ data }: { data: { date: string; totalAssets: number; totalLiabilities: number; netWorth: number }[] }) {
  if (data.length < 2) return <p className="text-xs text-muted-foreground text-center py-8">資料不足，至少需 2 筆歷史紀錄</p>

  const latest = data[data.length - 1]
  const first = data[0]
  const change = latest.netWorth - first.netWorth
  const changePct = first.netWorth > 0 ? (change / first.netWorth) * 100 : 0

  return (
    <div>
      {/* Summary stats */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-lg font-bold">NT${(latest.netWorth / 1e4).toFixed(0)}萬</span>
        <span className={`text-xs font-medium ${change >= 0 ? 'text-profit' : 'text-loss'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(1)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="liabGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0,70%,60%)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(0,70%,60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d: string) => {
              const parts = d.replace(/\//g, '-').split('-')
              return `${parts[1]}/${parts[2] ?? ''}`
            }}
          />
          <YAxis hide domain={['dataMin * 0.9', 'dataMax * 1.1']} />
          <Tooltip
            formatter={(v: number, name: string) => [`NT$${(v / 1e4).toFixed(0)}萬`, name]}
            labelFormatter={(d: string) => d}
            {...tooltipStyle}
          />
          <Area type="monotone" dataKey="totalAssets" name="流動資產" stroke="hsl(152,55%,50%)" strokeWidth={1.5} fill="none" dot={false} />
          <Area type="monotone" dataKey="totalLiabilities" name="負債" stroke="hsl(0,70%,60%)" strokeWidth={1} fill="url(#liabGrad)" dot={false} strokeDasharray="4 2" />
          <Area type="monotone" dataKey="netWorth" name="淨值" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Inline legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 rounded-full bg-accent inline-block" /> 淨值
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: 'hsl(152,55%,50%)' }} /> 流動資產
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: 'hsl(0,70%,60%)' }} /> 負債
        </span>
      </div>
    </div>
  )
}
