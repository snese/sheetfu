'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { queueTransaction } from '@/lib/offline-queue'

const TYPES = [
  { value: 'buy', label: '買入', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  { value: 'sell', label: '賣出', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  { value: 'dividend', label: '股利', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
] as const

export default function AddPage() {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), symbol: '', type: 'buy' as string, shares: '', price: '', fee: '', note: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET ?? '' },
        body: JSON.stringify({
          ...form,
          shares: Number(form.shares),
          price: form.price ? Number(form.price) : undefined,
          fee: form.fee ? Number(form.fee) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('ok')
      setMsg(`已新增至第 ${data.row} 列`)
      setForm((f) => ({ ...f, symbol: '', shares: '', price: '', fee: '', note: '' }))
    } catch (err: unknown) {
      if (!navigator.onLine) {
        await queueTransaction({ ...form, shares: Number(form.shares), price: form.price ? Number(form.price) : undefined, fee: form.fee ? Number(form.fee) : undefined })
        setStatus('ok')
        setMsg('已暫存，恢復連線後自動同步')
        setForm((f) => ({ ...f, symbol: '', shares: '', price: '', fee: '', note: '' }))
        return
      }
      setStatus('error')
      setMsg(err instanceof Error ? err.message : '儲存失敗')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-bold">記帳 Add Transaction</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => set('type', t.value)}
              className={cn('flex-1 py-2 rounded-lg border text-sm font-medium', form.type === t.value ? t.color : 'border-border text-muted-foreground')}>
              {t.label}
            </button>
          ))}
        </div>

        <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />

        <input placeholder="股票代號 e.g. AAPL / 2330" value={form.symbol} onChange={(e) => set('symbol', e.target.value.toUpperCase())} required
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="股數" value={form.shares} onChange={(e) => set('shares', e.target.value)} required min="0" step="any"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
          <input type="number" placeholder="價格 (選填)" value={form.price} onChange={(e) => set('price', e.target.value)} min="0" step="any"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>

        <input type="number" placeholder="手續費 (選填，台股自動算)" value={form.fee} onChange={(e) => set('fee', e.target.value)} min="0" step="any"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />

        <input placeholder="備註 (選填)" value={form.note} onChange={(e) => set('note', e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />

        <button type="submit" disabled={status === 'saving'}
          className="w-full rounded-lg bg-foreground text-background py-3 text-sm font-semibold disabled:opacity-50">
          {status === 'saving' ? '儲存中...' : '送出'}
        </button>

        {msg && (
          <p className={cn('text-sm text-center', status === 'ok' ? 'text-green-500' : 'text-red-500')}>{msg}</p>
        )}
      </form>
    </div>
  )
}
