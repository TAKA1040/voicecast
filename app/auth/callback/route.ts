import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// サーバーサイド認証コールバック - 最優先実行
export async function GET(request: NextRequest) {
  // デバッグ用のアラート（一時的）
  console.error('🚨🚨🚨 SERVER-SIDE CALLBACK IS WORKING! 🚨🚨🚨')
  console.log('=== ROUTE HANDLER EXECUTING ===')
  console.log('Request method:', request.method)
  console.log('Request URL:', request.url)
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  console.log('=== SERVER-SIDE Auth Callback (route.ts) ===')
  console.log('Server Auth Callback: Starting...')
  console.log('Server Auth Callback: Full URL:', request.url)
  console.log('Server Auth Callback: Code present:', !!code)
  console.log('Server Auth Callback: Code length:', code?.length || 0)
  console.log('Server Auth Callback: Origin:', origin)
  console.log('Server Auth Callback: Next:', next)
  console.log('Server Auth Callback: All params:', Object.fromEntries(searchParams.entries()))

  if (code) {
    console.log('Server Auth Callback: Code received, attempting authentication...')
    
    // 既存セッションをチェック（PKCEエラー回避のため）
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // まず既存セッションを確認
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('Server Auth Callback: Existing session found, using it')
        console.log('Server Auth Callback: User:', session.user.email)
        console.log('🎉 SUCCESS: Redirecting to admin with existing session')
        return response
      }
    } catch (err) {
      console.log('Server Auth Callback: No existing session, attempting code exchange')
    }

    // 既存セッションがない場合のみコード交換を試行
    try {
      console.log('Server Auth Callback: Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Server Auth Callback: Exchange failed:', error.message)
        // PKCEエラーの場合でも、既存セッションがあれば成功とみなす
        if (error.message.includes('code verifier')) {
          console.log('Server Auth Callback: PKCE error, checking for valid cookies...')
          // クッキーから直接セッション情報があるかチェック
          const authCookies = request.cookies.getAll().filter(cookie => 
            cookie.name.includes('auth-token')
          )
          if (authCookies.length > 0) {
            console.log('Server Auth Callback: Auth cookies found, proceeding to admin')
            return response
          }
        }
        return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
      }

      if (data.session) {
        console.log('Server Auth Callback: Session established successfully')
        console.log('Server Auth Callback: User:', data.session.user.email)
        return response
      }
    } catch (error) {
      console.error('Server Auth Callback: Unexpected error:', error)
      return NextResponse.redirect(`${origin}/login?error=server_error`)
    }
  }

  console.log('Server Auth Callback: No code, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}