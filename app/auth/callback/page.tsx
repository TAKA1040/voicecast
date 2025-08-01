'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      console.log('AuthCallback: Starting...')
      console.log('AuthCallback: Current URL:', window.location.href)

      try {
        // URLパラメータを確認
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          console.error('AuthCallback: OAuth error:', error, errorDescription)
          setProcessing(false)
          router.replace('/login?error=oauth_error')
          return
        }

        if (!code) {
          console.error('AuthCallback: No authorization code found')
          setProcessing(false)
          router.replace('/login?error=no_code')
          return
        }

        console.log('AuthCallback: Found authorization code, waiting for session...')

        // より簡単なアプローチ: 3秒待ってからセッションをチェック
        setTimeout(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              console.log('AuthCallback: Session found, redirecting to /admin')
              setProcessing(false)
              router.replace('/admin')
            } else {
              console.log('AuthCallback: No session found, redirecting to login')
              setProcessing(false)
              router.replace('/login?error=timeout')
            }
          } catch (err) {
            console.error('AuthCallback: Error checking session:', err)
            setProcessing(false)
            router.replace('/login?error=unexpected')
          }
        }, 3000)

      } catch (err) {
        console.error('AuthCallback: Unexpected error:', err)
        setProcessing(false)
        router.replace('/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (!processing) {
    return null // ページ遷移中
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">ログイン処理中...</p>
        <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}

