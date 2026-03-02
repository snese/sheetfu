import { NextResponse } from 'next/server'
import { getPortfolio } from '@/lib/sheets/reader'
import { getSnapshot } from '@/lib/sheets/cache'
import type { PortfolioHolding } from '@/lib/sheets/schema'

export const revalidate = 600

export async function GET() {
  try {
    const data = await getPortfolio()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    try {
      const snapshot = await getSnapshot<PortfolioHolding[]>('portfolio')
      return NextResponse.json({ ...snapshot, stale: true })
    } catch {
      return NextResponse.json({ error: 'No data available' }, { status: 503 })
    }
  }
}
