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

    // onAuthStateChange を使用して認証状態の変化をリッスン
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AdminPage: onAuthStateChange event:', event, 'session:', session ? 'present' : 'not present', session);
      if (session) {
        setUser(session.user)
        setLoading(false) // ユーザーが認証されたらローディングを終了
      } else {
        setUser(null)
        // セッションがない場合、ログインページへリダイレクト
        // ただし、初回ロード時にセッションがまだ確立されていない可能性があるので、
        // loadingがfalseになってからリダイレクトする
        if (!loading) { // loadingがfalseになった後のみリダイレクト
          console.log('AdminPage: Redirecting to /login due to no session and not loading.');
          router.push('/login')
        }
      }
    })

    // コンポーネントがマウントされた時点で現在の認証状態を一度だけ確認
    // onAuthStateChange がすぐに発火しない場合のフォールバック
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AdminPage: Initial getSession check. session:', session ? 'present' : 'not present', session, 'error:', error);
      if (session) {
        setUser(session.user);
      } else if (error) {
        console.error('AdminPage: Error during initial getSession:', error);
      }
      setLoading(false); // 初期セッションチェックが完了したらローディングを終了
    });


    return () => {
      subscription.unsubscribe()
    }
  }, [router, loading]) // loading を依存配列に追加して、loading の変化を監視

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    console.log('AdminPage: Displaying Loading...');
    return <div>Loading...</div>
  }

  // ユーザーが認証されていない場合はログインページへリダイレクト
  // onAuthStateChange でリダイレクトされるため、ここでは何も表示しない
  if (!user) {
    console.log('AdminPage: User not present, returning null.');
    return null;
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