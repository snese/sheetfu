'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: '總覽', icon: '📊' },
  { href: '/portfolio', label: '持倉', icon: '💼' },
  { href: '/add', label: '記帳', icon: '✏️' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background md:hidden">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            'flex flex-1 flex-col items-center py-2 text-xs',
            pathname === t.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          <span className="text-lg">{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
