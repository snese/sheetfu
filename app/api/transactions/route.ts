import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getTransactions, invalidateCache } from '@/lib/sheets/reader'
import { addTransaction, deleteRow } from '@/lib/sheets/writer'
import { getSnapshot } from '@/lib/sheets/cache'
import { handleApiError } from '@/lib/api-error'
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
      const data = limit ? snapshot.data.slice(0, limit) : snapshot.data
      return NextResponse.json({ data, updatedAt: snapshot.updatedAt, stale: true })
    } catch {
      return NextResponse.json({ error: 'No data available', code: 'NO_DATA' }, { status: 503 })
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await addTransaction(body)
    invalidateCache()
    revalidatePath('/')
    revalidatePath('/portfolio')
    return NextResponse.json({ success: true, ...result })
  } catch (e: unknown) {
    return handleApiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    const { row } = await request.json()
    if (typeof row !== 'number' || row < 2 || row > 10000) {
      return NextResponse.json({ error: 'Invalid row number (must be 2-10000)' }, { status: 400 })
    }
    await deleteRow(row)
    invalidateCache()
    revalidatePath('/')
    revalidatePath('/portfolio')
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return handleApiError(e)
  }
}
