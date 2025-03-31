import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req: request, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  )

  try {
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession()

    // Define protected and auth routes
    const protectedRoutes = ['/dashboard', '/profile', '/messages']
    const authRoutes = ['/sign-in', '/sign-up']

    const isProtectedRoute = protectedRoutes.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )
    
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname === route
    )

    // Handle protected routes
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/sign-in', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle auth routes
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return res

  } catch (e) {
    console.error('Middleware error:', e)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}