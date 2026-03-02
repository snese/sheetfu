'use client'
import { useEffect, useState } from 'react'
import { pendingCount, flushQueue } from '@/lib/offline-queue'

export function StaleIndicator() {
  const [pending, setPending] = useState(0)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => { setOnline(true); flushQueue().then(() => pendingCount().then(setPending)) }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    pendingCount().then(setPending)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (online && pending === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-xs text-center py-1">
      {!online ? '📡 離線模式 — 交易將在恢復連線後同步' : `⏳ ${pending} 筆待同步`}
    </div>
  )
}
