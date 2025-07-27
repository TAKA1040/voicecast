'use client'

import { auth } from '@/lib/firebase/client'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setMessage('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/admin')
    } catch (error: any) {
      setMessage('エラー: ' + error.code + ' ' + error.message)
    }
  }

  return (
    <div className="w-full max-w-xs p-8 space-y-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          VoiceCast
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          管理画面へようこそ
        </p>
      </div>
      
      <div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
        >
          <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.3l-66.8 66.8c-20-14.6-45.3-23.5-72.1-23.5-62.3 0-113.5 51.2-113.5 113.5s51.2 113.5 113.5 113.5c71.2 0 98.2-48.8 102.2-72.1H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          Googleアカウントでログイン
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-center text-red-600">{message}</p>}
    </div>
  )
}