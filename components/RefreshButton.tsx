'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function refresh() {
    setLoading(true)
    try {
      await fetch('/api/revalidate', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
      aria-label="重新整理"
    >
      {loading ? '⏳' : '🔄'} 重新整理
    </button>
  )
}
