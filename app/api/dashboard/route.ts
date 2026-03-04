import { NextResponse } from 'next/server'
import { getDashboardSummary } from '@/lib/sheets/reader'

export const revalidate = 600

export async function GET() {
  try {
    const data = await getDashboardSummary()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'No data available', code: 'NO_DATA' }, { status: 503 })
  }
}
