import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if trying to access protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isMemberRoute = pathname.startsWith('/member')

  // Get the stored user from cookies or localStorage (passed via request headers)
  const userCookie = request.cookies.get('church_user')
  
  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value)
    } catch {
      // Invalid cookie format
    }
  }

  // If no user and trying to access protected routes, redirect to login
  if ((isAdminRoute || isMemberRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is not admin trying to access admin route, redirect to member dashboard
  if (isAdminRoute && user && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/member', request.url))
  }

  // If user is trying to access member route but is admin, allow (they can view member areas)
  // But if they try to access member-only features, member page handles that

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*']
}
