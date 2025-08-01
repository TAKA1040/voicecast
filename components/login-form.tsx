'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginForm() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      switch (error) {
        case 'oauth_error':
          setMessage('Google認証中にエラーが発生しました。')
          break
        case 'no_code':
          setMessage('認証コードが取得できませんでした。')
          break
        case 'timeout':
          setMessage('認証がタイムアウトしました。再度お試しください。')
          break
        case 'unexpected':
          setMessage('予期しないエラーが発生しました。')
          break
        default:
          setMessage('ログインに失敗しました。')
      }
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setMessage('')
    setIsLoading(true)
    
    try {
      // リダイレクトURLを動的に取得
      const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
          return `${window.location.origin}/auth/callback`
        }
        // フォールバック（サーバーサイド）
        return 'https://voicecast-j8k09fiqv-takas-projects-ebc9ff02.vercel.app/auth/callback'
      }

      const redirectUrl = getRedirectUrl()
      console.log('Google OAuth redirect URL:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        console.error('Google OAuth error:', error)
        setMessage('エラー: ' + error.message)
        setIsLoading(false)
      }
      // 成功時はリダイレクトが発生するのでsetIsLoading(false)は不要
    } catch (err) {
      console.error('Unexpected error during Google login:', err)
      setMessage('予期しないエラーが発生しました。')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">管理画面ログイン</h2>
        <p className="text-gray-600">VoiceCast 管理者専用</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
          ) : (
            <svg className="w-6 h-6 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.3l-66.8 66.8c-20-14.6-45.3-23.5-72.1-23.5-62.3 0-113.5 51.2-113.5 113.5s51.2 113.5 113.5 113.5c71.2 0 98.2-48.8 102.2-72.1H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          )}
          {isLoading ? 'Google認証中...' : 'Googleで管理画面にログイン'}
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            🔒 セキュリティのため、Google認証のみ対応
          </p>
        </div>
      </div>
      
      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{message}</p>
        </div>
      )}
    </div>
  )
}
