'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      console.log('AuthCallback: Starting...')
      console.log('AuthCallback: code =', code ? 'present' : 'not present', code)

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('AuthCallback: Error exchanging code for session:', exchangeError)
          router.replace('/login?error=true')
          return
        }
        console.log('AuthCallback: Code exchanged for session successfully. Redirecting to /admin.')
        router.replace('/admin')
      } else {
        console.error('AuthCallback: Code not present in URL.')
        router.replace('/login?error=true')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Processing login...</div>
}
