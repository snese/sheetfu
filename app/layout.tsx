import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SheetFu',
  description: '家庭財務總覽 — Google Sheets as source of truth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
