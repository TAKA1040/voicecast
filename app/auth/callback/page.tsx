'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const { data: { session }, error: getSessionError } = await supabase.auth.getSession()

      console.log('AuthCallback: Starting...')
      console.log('AuthCallback: session =', session ? 'present' : 'not present', session)
      console.log('AuthCallback: getSessionError =', getSessionError)

      if (session) {
        console.log('AuthCallback: Session obtained successfully. Redirecting to /admin.')
        router.replace('/admin') // push の代わりに replace を使用
      } else {
        console.error('AuthCallback: Session not present or error getting session:', getSessionError)
        router.replace('/login?error=true') // push の代わりに replace を使用
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Processing login...</div>
}