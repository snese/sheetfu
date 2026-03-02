'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['hsl(220,70%,50%)', 'hsl(152,60%,40%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(280,60%,50%)', 'hsl(190,70%,45%)']

export function MiniPie({ data, nameKey = 'name', valueKey = 'value' }: {
  data: Record<string, unknown>[]; nameKey?: string; valueKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data} dataKey={valueKey} nameKey={nameKey}
          cx="50%" cy="50%" innerRadius={45} outerRadius={70}
          paddingAngle={3} strokeWidth={0}
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v: number) => `NT$${(v / 1e4).toFixed(0)}萬`}
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
