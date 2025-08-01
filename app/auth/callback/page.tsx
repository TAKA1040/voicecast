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

        // セッション状態の監視
        let timeoutId: NodeJS.Timeout
        let isResolved = false

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('AuthCallback: Auth state change:', event, session?.user?.email || 'no user')
          
          if (isResolved) return

          if (event === 'SIGNED_IN' && session?.user) {
            isResolved = true
            clearTimeout(timeoutId)
            subscription.unsubscribe()
            console.log('AuthCallback: Successfully signed in as:', session.user.email)
            console.log('AuthCallback: Forcing redirect to /admin')
            setProcessing(false)
            // 強制的に管理画面にリダイレクト
            window.location.href = '/admin'
          }
        })

        // 8秒後にタイムアウト
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true
            subscription.unsubscribe()
            console.log('AuthCallback: Timeout - redirecting to login')
            setProcessing(false)
            router.replace('/login?error=timeout')
          }
        }, 8000)

        // 初期セッションチェック
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (initialSession?.user && !isResolved) {
          isResolved = true
          clearTimeout(timeoutId)
          subscription.unsubscribe()
          console.log('AuthCallback: Initial session found:', initialSession.user.email)
          console.log('AuthCallback: Forcing redirect to /admin via initial session')
          setProcessing(false)
          // 強制的に管理画面にリダイレクト
          window.location.href = '/admin'
        }

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

