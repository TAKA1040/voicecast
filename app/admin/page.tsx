'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminForm from '@/components/admin-form'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
        router.push('/login') // 認証されていない場合はログインページへリダイレクト
      }
      setLoading(false)
    })

    // 初期ロード時の認証状態を確認
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // ユーザーが認証されていない場合はログインページへリダイレクト (onAuthStateChangeで処理されるため、ここでは不要だが念のため残す)
  if (!user) {
    return null // onAuthStateChangeでリダイレクトされるため、ここでは何も表示しない
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ログアウト
          </button>
        </div>
        <AdminForm user={user} />
      </div>
    </div>
  )
}