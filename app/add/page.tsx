'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { queueTransaction } from '@/lib/offline-queue'

const TYPES = [
  { value: 'buy', label: '買入', color: 'bg-profit/10 text-profit border-profit/30' },
  { value: 'sell', label: '賣出', color: 'bg-loss/10 text-loss border-loss/30' },
  { value: 'dividend', label: '股利', color: 'bg-accent/10 text-accent border-accent/30' },
] as const

const BROKERS = ['Firstrade', '元大', '國泰', '富邦', '凱基', 'Interactive Brokers', ''] as const

export default function AddPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    symbol: '', type: 'buy' as string, shares: '', price: '', fee: '', note: '',
    broker: 'Firstrade', assetType: '個股',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const inputCls = 'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors'

  return (
    <div className="max-w-md mx-auto space-y-5">
      <form onSubmit={submit} className="space-y-4">
        {/* Transaction Type */}
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => set('type', t.value)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                form.type === t.value ? t.color : 'border-border text-muted-foreground hover:border-muted-foreground/30')}>
              {t.label}
            </button>
          ))}
        </div>

        <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required className={inputCls} />

        {/* Broker + Asset Type */}
        <div className="grid grid-cols-2 gap-3">
          <select value={form.broker} onChange={(e) => set('broker', e.target.value)} className={inputCls}>
            {BROKERS.map(b => <option key={b} value={b}>{b || '其他'}</option>)}
          </select>
          <select value={form.assetType} onChange={(e) => set('assetType', e.target.value)} className={inputCls}>
            <option value="個股">個股</option>
            <option value="ETF">ETF</option>
            <option value="基金">基金</option>
          </select>
        </div>

        <input placeholder="股票代號 e.g. AAPL / 2330" value={form.symbol} onChange={(e) => set('symbol', e.target.value.toUpperCase())} required className={inputCls} />

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="股數" value={form.shares} onChange={(e) => set('shares', e.target.value)} required min="0" step="any" className={inputCls} />
          <input type="number" placeholder="價格 (選填)" value={form.price} onChange={(e) => set('price', e.target.value)} min="0" step="any" className={inputCls} />
        </div>

        <input type="number" placeholder="手續費 (選填，台股自動算)" value={form.fee} onChange={(e) => set('fee', e.target.value)} min="0" step="any" className={inputCls} />

        <input placeholder="備註 (選填)" value={form.note} onChange={(e) => set('note', e.target.value)} className={inputCls} />

        <button type="submit" disabled={status === 'saving'}
          className="w-full rounded-xl bg-accent text-accent-foreground py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
          {status === 'saving' ? '儲存中...' : '送出'}
        </button>

        {msg && (
          <p className={cn('text-sm text-center font-medium', status === 'ok' ? 'text-profit' : 'text-loss')}>{msg}</p>
        )}
      </form>
    </div>
  )
}
