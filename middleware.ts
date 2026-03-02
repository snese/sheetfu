import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function middleware(request: NextRequest) {
  // Write ops require authenticated user
  if (request.nextUrl.pathname.startsWith('/api/') && request.method !== 'GET') {
    const email = request.headers.get('cf-access-authenticated-user-email')
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (ALLOWED_EMAILS.length && !ALLOWED_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/:path*' }
