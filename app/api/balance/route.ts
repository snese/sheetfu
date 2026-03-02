import { NextResponse } from 'next/server'
import { getBalanceSheet } from '@/lib/sheets/reader'
import { getSnapshot } from '@/lib/sheets/cache'
import type { BalanceSheetItem } from '@/lib/sheets/schema'

export const revalidate = 600

export async function GET() {
  try {
    const data = await getBalanceSheet()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    try {
      const snapshot = await getSnapshot<BalanceSheetItem[]>('balance')
      return NextResponse.json({ ...snapshot, stale: true })
    } catch {
      return NextResponse.json({ error: 'No data available' }, { status: 503 })
    }
  }
}
