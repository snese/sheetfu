import { NextResponse } from 'next/server'
import { getBalanceSheet } from '@/lib/sheets/cache'

export const revalidate = 600

export async function GET() {
  const result = await getBalanceSheet()
  return NextResponse.json({
    data: result.data,
    updatedAt: result.stale ? result.updatedAt : new Date().toISOString(),
    ...(result.stale && { stale: true }),
  })
}
