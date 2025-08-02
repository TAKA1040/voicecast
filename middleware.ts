import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for API routes and static files
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Enhanced cookie options for cross-domain compatibility
            res.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              // Allow cross-subdomain cookies in production
              domain: process.env.NODE_ENV === 'production' && req.nextUrl.hostname.includes('vercel.app')
                ? '.vercel.app' 
                : undefined
            })
          },
          remove(name: string, options: any) {
            res.cookies.set({
              name,
              value: '',
              ...options,
              expires: new Date(0),
              path: '/',
              domain: process.env.NODE_ENV === 'production' && req.nextUrl.hostname.includes('vercel.app')
                ? '.vercel.app' 
                : undefined
            })
          }
        }
      }
    )

    // Enhanced admin route protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      console.log('Middleware: Protecting admin route:', req.nextUrl.pathname)
      console.log('Middleware: Request domain:', req.nextUrl.hostname)
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Middleware: Auth error:', error)
      }
      
      console.log('Middleware: Session present:', !!session)
      console.log('Middleware: User present:', !!session?.user)
      console.log('Middleware: User email:', session?.user?.email)
      
      if (!session) {
        console.log('Middleware: No session, redirecting to login')
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
        redirectUrl.searchParams.set('reason', 'auth_required')
        return NextResponse.redirect(redirectUrl)
      } else {
        console.log('Middleware: Session valid, allowing access to admin')
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // If middleware fails, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}