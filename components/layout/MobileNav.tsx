'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: '總覽', icon: '📊' },
  { href: '/portfolio', label: '持倉', icon: '💼' },
  { href: '/assets', label: '資產', icon: '🏦' },
  { href: '/add', label: '交易', icon: '✏️' },
  { href: '/insurance', label: '保單', icon: '🛡️' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background/80 backdrop-blur-lg md:hidden z-40">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href}
          className={cn(
            'flex flex-1 flex-col items-center py-2 text-[10px] transition-colors',
            pathname === t.href ? 'text-accent font-semibold' : 'text-muted-foreground'
          )}>
          <span className="text-base">{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}

export function DesktopNav() {
  const pathname = usePathname()
  return (
    <nav className="hidden md:flex items-center gap-1">
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
  )
}
