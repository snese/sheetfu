'use client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const RISK_COLORS = ['hsl(220,60%,55%)', 'hsl(152,55%,45%)', 'hsl(38,80%,50%)', 'hsl(15,80%,50%)', 'hsl(0,72%,51%)']

export function RiskBar({ data }: { data: { level: string; valueTwd: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="level" width={55} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => `NT$${(v / 1e4).toFixed(0)}萬`}
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="valueTwd" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
