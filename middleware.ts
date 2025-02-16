import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Only apply to admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Check for admin cookie
  const isAdmin = request.cookies.get('isAdmin')?.value === 'true'

  if (!isAdmin) {
    const redirectUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 