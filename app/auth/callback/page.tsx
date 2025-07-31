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
      console.log('AuthCallback: accessToken =', accessToken ? 'present' : 'not present', accessToken)
      console.log('AuthCallback: refreshToken =', refreshToken ? 'present' : 'not present', refreshToken)

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
        console.log('AuthCallback: Session set successfully. Redirecting to /admin.')
        // セッション設定後、直接 /admin にリダイレクト
        router.push('/admin')
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
