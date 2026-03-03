'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: '總覽' },
  { href: '/portfolio', label: '持倉' },
  { href: '/assets', label: '資產' },
  { href: '/add', label: '交易' },
  { href: '/insurance', label: '保單' },
]

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-40">
      <Link href="/" className="text-sm font-bold text-foreground">SheetFu</Link>
      <nav className="flex items-center gap-1">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              pathname === t.href
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
            {t.label}
          </Link>
        ))}
      </nav>
      <button onClick={refresh} disabled={loading}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        aria-label="重新整理">
        {loading ? '⏳' : '🔄'}
      </button>
    </header>
  )
}
