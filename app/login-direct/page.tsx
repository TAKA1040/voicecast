'use client'

import LoginForm from '@/components/login-form'

export default function DirectLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">管理者ログイン</h1>
        <LoginForm />
      </div>
    </div>
  )
}