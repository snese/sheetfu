import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect mutating API calls
  if (request.nextUrl.pathname.startsWith('/api/') && request.method !== 'GET') {
    const secret = process.env.API_SECRET
    if (secret && request.headers.get('x-api-secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/:path*' }
