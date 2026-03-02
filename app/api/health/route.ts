import { NextResponse } from 'next/server'
import { sheets, SHEET_ID } from '@/lib/sheets/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  let sheetsOk = false
  try {
    await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'spreadsheetId' })
    sheetsOk = true
  } catch {}
  return NextResponse.json({ ok: true, sheets: sheetsOk, ts: new Date().toISOString() }, { status: sheetsOk ? 200 : 503 })
}
