'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { queueTransaction } from '@/lib/offline-queue'

const TYPES = [
  { value: 'buy', label: '買入', color: 'bg-profit/10 text-profit border-profit/30' },
  { value: 'sell', label: '賣出', color: 'bg-loss/10 text-loss border-loss/30' },
  { value: 'dividend', label: '股利', color: 'bg-accent/10 text-accent border-accent/30' },
] as const

const BROKERS = ['Firstrade', '元大', '國泰', '富邦', '富邦證券', '凱基', 'Interactive Brokers'] as const
const QUICK_SYMBOLS = ['TSLA', 'AMZN', 'NVDA', 'VTI', '0050', '00675L', '00631L', '006208'] as const
const ETF_LIST = ['VTI', 'VEA', 'VWO', 'VOO', 'VT', 'TLT', 'BNDW']

function inferDefaults(symbol: string) {
  const isTw = /^\d/.test(symbol)
  return {
    broker: isTw ? '富邦證券' : 'Firstrade',
    assetType: isTw ? (symbol.startsWith('00') ? 'ETF' : '個股') : (ETF_LIST.includes(symbol) ? 'ETF' : '個股'),
  }
}

type RecentTx = { date: string; symbol: string; type: string; shares: number }

export default function AddPage() {
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState('buy')
  const [shares, setShares] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [broker, setBroker] = useState('Firstrade')
  const [assetType, setAssetType] = useState('個股')
  const [price, setPrice] = useState('')
  const [fee, setFee] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [recentSymbols, setRecentSymbols] = useState<string[]>([])
  const [recentTx, setRecentTx] = useState<RecentTx[]>([])
  const sharesRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try { setRecentSymbols(JSON.parse(localStorage.getItem('sheetfu_recent') ?? '[]')) } catch {}
    fetch('/api/transactions?limit=5').then(r => r.json()).then(j => setRecentTx(j.data ?? [])).catch(() => {})
  }, [])

  const pickSymbol = (s: string) => {
    setSymbol(s)
    const d = inferDefaults(s)
    setBroker(d.broker)
    setAssetType(d.assetType)
    setTimeout(() => sharesRef.current?.focus(), 50)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    const inferred = inferDefaults(symbol)
    const payload = {
      date, symbol, type, shares: Number(shares),
      broker: expanded ? broker : inferred.broker,
      assetType: expanded ? assetType : inferred.assetType,
      price: price ? Number(price) : undefined,
      fee: fee ? Number(fee) : undefined,
      note,
    }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('ok')
      setMsg(`已新增至第 ${data.row} 列`)
      const updated = [symbol, ...recentSymbols.filter(s => s !== symbol)].slice(0, 5)
      setRecentSymbols(updated)
      localStorage.setItem('sheetfu_recent', JSON.stringify(updated))
      setRecentTx(prev => [{ date, symbol, type, shares: Number(shares) }, ...prev].slice(0, 5))
      setSymbol(''); setShares(''); setPrice(''); setFee(''); setNote('')
    } catch (err: unknown) {
      if (!navigator.onLine) {
        await queueTransaction(payload)
        setStatus('ok')
        setMsg('已暫存，恢復連線後自動同步')
        setSymbol(''); setShares(''); setPrice(''); setFee(''); setNote('')
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
      <PageHeader title="交易" />
      <form onSubmit={submit} className="space-y-4">
        {/* Type */}
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setType(t.value)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                type === t.value ? t.color : 'border-border text-muted-foreground hover:border-muted-foreground/30')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Quick Symbol */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">快速選擇</p>
          <div className="flex flex-wrap gap-1.5">
            {allQuick.map(s => (
              <button key={s} type="button" onClick={() => pickSymbol(s)}
                className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  symbol === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol + Shares — the only 2 inputs always visible */}
        <input placeholder="股票代號 e.g. AAPL / 2330" value={symbol}
          onChange={(e) => { const v = e.target.value.toUpperCase(); setSymbol(v); const d = inferDefaults(v); setBroker(d.broker); setAssetType(d.assetType) }}
          required className={inputCls} />
        <input ref={sharesRef} type="number" placeholder="股數" value={shares}
          onChange={(e) => setShares(e.target.value)} required min="0" step="any" className={inputCls} />

        {/* Expandable: date, broker, price, fee, note */}
        <button type="button" onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? '▾ 收起選項' : '▸ 更多選項（日期、價格、手續費⋯）'}
        </button>

        {expanded && (
          <div className="space-y-3 pt-1">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={broker} onChange={(e) => setBroker(e.target.value)} className={inputCls}>
                {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className={inputCls}>
                <option value="個股">個股</option>
                <option value="ETF">ETF</option>
                <option value="基金">基金</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="價格（選填）" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="any" className={inputCls} />
              <input type="number" placeholder="手續費（選填）" value={fee} onChange={(e) => setFee(e.target.value)} min="0" step="any" className={inputCls} />
            </div>
            <input placeholder="備註（選填）" value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
          </div>
        )}

        <button type="submit" disabled={status === 'saving'}
          className="w-full rounded-xl bg-accent text-accent-foreground py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
          {status === 'saving' ? '儲存中...' : '送出'}
        </button>

        {msg && <p className={cn('text-sm text-center font-medium', status === 'ok' ? 'text-profit' : 'text-loss')}>{msg}</p>}
      </form>

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">最近交易</p>
          <div className="space-y-2">
            {recentTx.map((tx, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    tx.type === '買入' || tx.type === 'buy' ? 'bg-profit/10 text-profit' :
                    tx.type === '賣出' || tx.type === 'sell' ? 'bg-loss/10 text-loss' :
                    'bg-accent/10 text-accent'
                  }`}>{tx.type === 'buy' ? '買入' : tx.type === 'sell' ? '賣出' : tx.type === 'dividend' ? '股利' : tx.type}</span>
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{tx.symbol}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">×{tx.shares}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
