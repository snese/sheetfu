import { NextResponse } from 'next/server'
import { getDashboardSummary } from '@/lib/sheets/reader'
import { getSnapshot } from '@/lib/sheets/cache'
import type { DashboardSummary } from '@/lib/sheets/schema'

export const revalidate = 600

export async function GET() {
  try {
    const data = await getDashboardSummary()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    try {
      const snapshot = await getSnapshot<DashboardSummary>('dashboard')
      return NextResponse.json({ data: snapshot.data, updatedAt: snapshot.updatedAt, stale: true })
    } catch {
      return NextResponse.json({ error: 'No data available' }, { status: 503 })
    }
  }
}
