import type { Metadata } from 'next'
import './globals.css'
import { MobileNav } from '@/components/layout/MobileNav'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { StaleIndicator } from '@/components/layout/StaleIndicator'
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'SheetFu',
  description: '家庭財務總覽 — Google Sheets as source of truth',
  manifest: '/manifest.json',
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="pb-16 md:pb-0">
        <ThemeProvider>
          <StaleIndicator />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <MobileNav />
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
