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

        console.log('AuthCallback: Found authorization code, exchanging for session...')
        console.log('AuthCallback: Code length:', code.length)
        console.log('AuthCallback: Current domain:', window.location.host)

        try {
          // 認証コードをセッションに交換
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('AuthCallback: Code exchange failed:', exchangeError)
            console.error('AuthCallback: Error details:', exchangeError.message)
            setProcessing(false)
            router.replace(`/login?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          if (data.session?.user) {
            console.log('AuthCallback: Session established successfully')
            console.log('AuthCallback: User ID:', data.session.user.id)
            console.log('AuthCallback: User email:', data.session.user.email)
            console.log('AuthCallback: Session expires:', data.session.expires_at)
            console.log('AuthCallback: Access token present:', !!data.session.access_token)
            
            setProcessing(false)
            
            // セッション確認のため再取得
            const { data: verifyData, error: verifyError } = await supabase.auth.getSession()
            if (verifyError) {
              console.error('AuthCallback: Session verification failed:', verifyError)
            } else {
              console.log('AuthCallback: Session verified:', !!verifyData.session)
            }
            
            console.log('AuthCallback: Performing redirect to /admin')
            // 即座にリダイレクト
            window.location.href = '/admin'
          } else {
            console.log('AuthCallback: No session after exchange')
            console.log('AuthCallback: Exchange data:', data)
            setProcessing(false)
            router.replace('/login?error=no_session')
          }
        } catch (exchangeErr) {
          console.error('AuthCallback: Exception during code exchange:', exchangeErr)
          setProcessing(false)
          router.replace('/login?error=exchange_exception')
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

