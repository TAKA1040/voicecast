'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
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

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage('エラー: ' + error.message)
      return
    }
    router.push('/admin')
  }

  const handleGoogleLogin = async () => {
    setMessage('')
    
    // リダイレクトURLを動的に取得
    const getRedirectUrl = () => {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/auth/callback`
      }
      // フォールバック（サーバーサイド）
      return 'https://voicecast-a1frzgue1-takas-projects-ebc9ff02.vercel.app/auth/callback'
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
    }
  }

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">VoiceCast Login</h2>
      <form className="space-y-6" onSubmit={handleSignIn}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ログイン
          </button>
        </div>
      </form>
      <div className="relative flex items-center justify-center">
        <span className="absolute px-3 bg-white text-sm text-gray-500">または</span>
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.3l-66.8 66.8c-20-14.6-45.3-23.5-72.1-23.5-62.3 0-113.5 51.2-113.5 113.5s51.2 113.5 113.5 113.5c71.2 0 98.2-48.8 102.2-72.1H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          Googleでログイン
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-center text-red-600">{message}</p>}
    </div>
  )
}
