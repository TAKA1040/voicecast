'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminForm from '@/components/admin-form'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Implicit OAuth用のURLハッシュ処理
    const processHashParams = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('AdminPage: Found OAuth tokens in URL hash')
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          // URLからハッシュをクリア
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
      }
    }

    processHashParams()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AdminPage: onAuthStateChange event:', event, 'session:', session ? 'present' : 'not present', session);
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Redirect logic based on user and loading state
  useEffect(() => {
    if (!loading && !user) {
      console.log('AdminPage: Redirecting to /login because not loading and user is null.');
      // Add a small delay to allow state updates to propagate
      setTimeout(() => {
        router.push('/login');
      }, 50); // 50ms delay
    }
  }, [loading, user, router]); // Depend on loading, user, and router

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    console.log('AdminPage: Displaying Loading...');
    return <div>Loading...</div>
  }

  if (!user) {
    console.log('AdminPage: User is null after loading, returning null (should be redirected by useEffect). ');
    return null; // Should be caught by the redirect useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🏠 ホームに戻る
          </Link>
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