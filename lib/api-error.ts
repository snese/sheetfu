import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
  ) {
    super(message)
  }
}

export function handleApiError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status })
  }
  const msg = e instanceof Error ? e.message : 'Unknown error'
  // Sheets API specific errors
  if (msg.includes('quota')) return NextResponse.json({ error: 'API quota exceeded', code: 'QUOTA' }, { status: 429 })
  if (msg.includes('UNAUTHENTICATED') || msg.includes('invalid_grant'))
    return NextResponse.json({ error: 'Sheets API auth failed', code: 'SHEETS_AUTH' }, { status: 502 })
  return NextResponse.json({ error: msg, code: 'INTERNAL' }, { status: 500 })
}
