import { NextResponse } from 'next/server'
import { getBalanceSheet } from '@/lib/sheets/cache'

export const revalidate = 600

export async function GET() {
  try {
    const result = await getBalanceSheet()
    return NextResponse.json({
      data: result.data,
      updatedAt: result.stale ? result.updatedAt : new Date().toISOString(),
      ...(result.stale && { stale: true }),
    })
  } catch {
    return NextResponse.json({ error: 'No data available', code: 'NO_DATA' }, { status: 503 })
  }
}
