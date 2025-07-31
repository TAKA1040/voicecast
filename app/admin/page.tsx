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
      console.log('AdminPage: onAuthStateChange event:', event, 'session:', session ? 'present' : 'not present', session);
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false) // Loading is done once the auth state is determined by onAuthStateChange
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to run once on mount

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