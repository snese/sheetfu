'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { queueTransaction } from '@/lib/offline-queue'

const TYPES = [
  { value: 'buy', label: '買入', color: 'bg-profit/10 text-profit border-profit/30' },
  { value: 'sell', label: '賣出', color: 'bg-loss/10 text-loss border-loss/30' },
  { value: 'dividend', label: '股利', color: 'bg-accent/10 text-accent border-accent/30' },
] as const

const BROKERS = ['Firstrade', '元大', '國泰', '富邦', '富邦證券', '凱基', 'Interactive Brokers'] as const
const QUICK_SYMBOLS = ['TSLA', 'AMZN', 'NVDA', 'VTI', '0050', '00675L', '00631L', '006208'] as const

export default function AddPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    symbol: '', type: 'buy' as string, shares: '', price: '', fee: '', note: '',
    broker: 'Firstrade', assetType: '個股',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [recentSymbols, setRecentSymbols] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sheetfu_recent') ?? '[]')
      setRecentSymbols(stored)
    } catch { /* ignore */ }
  }, [])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const pickSymbol = (s: string) => {
    set('symbol', s)
    // Auto-detect market
    if (/^\d/.test(s)) {
      set('broker', '富邦證券')
      set('assetType', s.startsWith('00') ? 'ETF' : '個股')
    } else {
      set('broker', 'Firstrade')
      set('assetType', ['VTI','VEA','VWO','VOO','VT','TLT','BNDW'].includes(s) ? 'ETF' : '個股')
    }
  }

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
      // Save to recent
      const updated = [form.symbol, ...recentSymbols.filter(s => s !== form.symbol)].slice(0, 5)
      setRecentSymbols(updated)
      localStorage.setItem('sheetfu_recent', JSON.stringify(updated))
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
  const allQuick = [...new Set([...recentSymbols, ...QUICK_SYMBOLS])].slice(0, 8)

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

        {/* Quick Symbol Picker */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">快速選擇</p>
          <div className="flex flex-wrap gap-1.5">
            {allQuick.map(s => (
              <button key={s} type="button" onClick={() => pickSymbol(s)}
                className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  form.symbol === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required className={inputCls} />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.broker} onChange={(e) => set('broker', e.target.value)} className={inputCls}>
            {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={form.assetType} onChange={(e) => set('assetType', e.target.value)} className={inputCls}>
            <option value="個股">個股</option>
            <option value="ETF">ETF</option>
            <option value="基金">基金</option>
          </select>
        </div>

        <input placeholder="股票代號 e.g. AAPL / 2330" value={form.symbol}
          onChange={(e) => set('symbol', e.target.value.toUpperCase())} required className={inputCls} />

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

        {msg && <p className={cn('text-sm text-center font-medium', status === 'ok' ? 'text-profit' : 'text-loss')}>{msg}</p>}
      </form>
    </div>
  )
}
