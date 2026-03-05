import { NextResponse } from 'next/server'
import { getDashboard } from '@/lib/sheets/cache'

export const revalidate = 600

export async function GET() {
  const result = await getDashboard()
  return NextResponse.json({
    data: result.data,
    updatedAt: result.stale ? result.updatedAt : new Date().toISOString(),
    ...(result.stale && { stale: true }),
  })
}
