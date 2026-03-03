'use client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { RISK_COLORS, tooltipStyle } from '@/lib/chart-theme'

export function RiskBar({ data }: { data: { level: string; valueTwd: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="level" width={55} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => `NT$${(v / 1e4).toFixed(0)}萬`}
          {...tooltipStyle}
        />
        <Bar dataKey="valueTwd" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
