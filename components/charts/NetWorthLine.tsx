'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export function NetWorthLine({ data }: { data: { date: string; netWorth: number }[] }) {
  if (data.length < 2) return <p className="text-xs text-muted-foreground text-center py-8">資料不足，至少需 2 筆歷史紀錄</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
        <defs>
          <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={['dataMin - 1000000', 'dataMax + 1000000']} />
        <Tooltip
          formatter={(v: number) => `NT$${(v / 1e4).toFixed(0)}萬`}
          labelStyle={{ fontSize: 11 }}
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="netWorth" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
