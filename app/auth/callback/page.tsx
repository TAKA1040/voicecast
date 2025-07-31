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

      console.log('AuthCallback: Starting...')
      console.log('AuthCallback: hash =', hash)
      console.log('AuthCallback: accessToken =', accessToken ? 'present' : 'not present', accessToken) // accessTokenの値をログに出力
      console.log('AuthCallback: refreshToken =', refreshToken ? 'present' : 'not present', refreshToken) // refreshTokenの値をログに出力

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (setSessionError) {
          console.error('AuthCallback: Error setting session:', setSessionError)
          router.push('/login?error=true')
          return
        }
        console.log('AuthCallback: Session set successfully.')

        // セッション設定後、ユーザー情報を取得して認証状態を確認
        const { data: { user }, error: getUserError } = await supabase.auth.getUser()

        if (getUserError || !user) {
          console.error('AuthCallback: Error getting user after session set:', getUserError)
          router.push('/login?error=true')
        } else {
          console.log('AuthCallback: User obtained successfully:', user.email)
          // 認証成功、/admin にリダイレクト
          router.push('/admin')
        }
      } else {
        console.error('AuthCallback: Access token or refresh token not present.')
        // トークンがない場合、エラーページまたはログインページにリダイレクト
        router.push('/login?error=true')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Processing login...</div>
}