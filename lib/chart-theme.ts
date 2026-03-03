// Shared chart theming — uses CSS variables so dark mode works automatically
export const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
    color: 'hsl(var(--foreground))',
  },
  labelStyle: { color: 'hsl(var(--muted-foreground))', fontSize: 11 },
  itemStyle: { color: 'hsl(var(--foreground))' },
}

// Light-friendly + dark-friendly palette (higher lightness for dark bg)
export const PIE_COLORS = [
  'hsl(220,70%,60%)', 'hsl(152,55%,50%)', 'hsl(38,85%,55%)',
  'hsl(0,70%,60%)', 'hsl(280,55%,60%)', 'hsl(190,65%,50%)',
]

export const RISK_COLORS = [
  'hsl(220,55%,60%)', 'hsl(152,50%,50%)', 'hsl(38,75%,55%)',
  'hsl(15,75%,55%)', 'hsl(0,65%,58%)',
]
