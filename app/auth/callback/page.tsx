'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1)) // Remove the leading '#'
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        // Redirect to a protected route, e.g., /admin
        router.push('/admin')
      } else {
        // Handle the case where tokens are not present, maybe redirect to an error page
        router.push('/login?error=true')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Processing login...</div>
}
