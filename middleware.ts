import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // getUser() will trigger a token refresh if necessary and update the response cookies
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    
    // Keep the sales CRM and school workspace in distinct URL contexts.
    const isCrmRoute = path === '/crm' || path.startsWith('/crm/')
    const isProtectedRoute = path.startsWith('/dashboard') || isCrmRoute
    
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/login', request.url)
      if (isCrmRoute) redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    if (path === '/login' && user) {
      const requestedNext = request.nextUrl.searchParams.get('next')
      const next = requestedNext && (requestedNext === '/crm' || requestedNext.startsWith('/crm/')) ? requestedNext : '/dashboard'
      const redirectUrl = new URL(next, request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
