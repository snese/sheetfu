import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { invalidateCache } from '@/lib/sheets/reader'

export async function POST() {
  invalidateCache()
  revalidatePath('/')
  revalidatePath('/portfolio')
  return NextResponse.json({ revalidated: true, ts: new Date().toISOString() })
}
