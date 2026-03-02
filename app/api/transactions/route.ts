import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/sheets/reader'
import { getSnapshot } from '@/lib/sheets/cache'
import type { Transaction } from '@/lib/sheets/schema'

export const revalidate = 600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

  try {
    const data = await getTransactions(limit)
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    try {
      const snapshot = await getSnapshot<Transaction[]>('transactions')
      const data = limit ? snapshot.data.slice(-limit) : snapshot.data
      return NextResponse.json({ data, updatedAt: snapshot.updatedAt, stale: true })
    } catch {
      return NextResponse.json({ error: 'No data available' }, { status: 503 })
    }
  }
}
