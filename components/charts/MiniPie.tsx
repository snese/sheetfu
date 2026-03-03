'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PIE_COLORS, tooltipStyle } from '@/lib/chart-theme'

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
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v: number) => `NT$${(v / 1e4).toFixed(0)}萬`}
          {...tooltipStyle}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
