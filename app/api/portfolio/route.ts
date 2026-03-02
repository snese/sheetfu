import { NextResponse } from 'next/server'
import { getPortfolio } from '@/lib/sheets/reader'

export const revalidate = 600

export async function GET() {
  try {
    const data = await getPortfolio()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'No data available' }, { status: 503 })
  }
}
