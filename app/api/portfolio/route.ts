import { NextResponse } from 'next/server'
import { getPortfolio } from '@/lib/sheets/cache'

export const revalidate = 600

export async function GET() {
  try {
    const result = await getPortfolio()
    return NextResponse.json({
      data: result.data,
      updatedAt: result.stale ? result.updatedAt : new Date().toISOString(),
      ...(result.stale && { stale: true }),
    })
  } catch {
    return NextResponse.json({ error: 'No data available', code: 'NO_DATA' }, { status: 503 })
  }
}
