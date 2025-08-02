import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// 既存セッションで直接管理画面にアクセス
export async function GET(request: NextRequest) {
  console.log('🔗 Direct Admin Access Route')
  
  const { origin } = new URL(request.url)
  let response = NextResponse.redirect(`${origin}/admin`)
  
  try {
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
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session?.user) {
      console.log('✅ Direct Admin: Valid session found')
      console.log('User:', session.user.email)
      return response
    } else {
      console.log('❌ Direct Admin: No valid session')
      return NextResponse.redirect(`${origin}/login`)
    }
  } catch (error) {
    console.error('Direct Admin Error:', error)
    return NextResponse.redirect(`${origin}/login`)
  }
}