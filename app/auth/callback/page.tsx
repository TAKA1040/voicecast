'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1)) // Remove the leading '#'
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (setSessionError) {
          console.error('Error setting session:', setSessionError)
          router.push('/login?error=true')
          return
        }

        // セッション設定後、ユーザー情報を取得して認証状態を確認
        const { data: { user }, error: getUserError } = await supabase.auth.getUser()

        if (getUserError || !user) {
          console.error('Error getting user after session set:', getUserError)
          router.push('/login?error=true')
        } else {
          // 認証成功、/admin にリダイレクト
          router.push('/admin')
        }
      } else {
        // トークンがない場合、エラーページまたはログインページにリダイレクト
        router.push('/login?error=true')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Processing login...</div>
}