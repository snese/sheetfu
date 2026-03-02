import type { Metadata } from 'next'
import './globals.css'
import { MobileNav } from '@/components/layout/MobileNav'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

export const metadata: Metadata = {
  title: 'SheetFu',
  description: '家庭財務總覽 — Google Sheets as source of truth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="pb-16 md:pb-0">
        <ThemeProvider>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
