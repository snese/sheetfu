import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'TWD'): string {
  if (Math.abs(value) >= 1e8) return `${currency === 'TWD' ? 'NT$' : '$'}${(value / 1e8).toFixed(2)}億`
  if (Math.abs(value) >= 1e4) return `${currency === 'TWD' ? 'NT$' : '$'}${(value / 1e4).toFixed(1)}萬`
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatPnl(value: number): { text: string; color: string; arrow: string } {
  const color = value >= 0 ? 'text-green-500' : 'text-red-500'
  const arrow = value >= 0 ? '▲' : '▼'
  return { text: formatCurrency(value), color, arrow }
}
