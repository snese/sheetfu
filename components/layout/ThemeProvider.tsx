'use client'
import { useEffect, useState } from 'react'
import { DesktopNav } from './MobileNav'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(stored === 'dark' || (!stored && prefersDark))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">SheetFu</h1>
          <DesktopNav />
        </div>
        <button onClick={() => setDark(!dark)} className="text-sm px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="切換主題">
          {dark ? '☀️' : '🌙'}
        </button>
      </header>
      {children}
    </>
  )
}
