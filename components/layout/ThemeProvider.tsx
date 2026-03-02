'use client'
import { useEffect, useState } from 'react'

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
        <h1 className="text-lg font-bold">SheetFu 📊</h1>
        <button onClick={() => setDark(!dark)} className="text-sm px-2 py-1 rounded bg-muted">
          {dark ? '☀️' : '🌙'}
        </button>
      </header>
      {children}
    </>
  )
}
