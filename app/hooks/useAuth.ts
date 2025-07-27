'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useFirebase } from './useFirebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const firebase = useFirebase()

  useEffect(() => {
    if (firebase) {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user)
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      setLoading(false)
    }
  }, [firebase])

  return { user, loading }
}