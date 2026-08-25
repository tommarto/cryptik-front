import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Sesión guardada de una visita anterior, o la que viene en la URL después
    // de volver de Google.
    authService
      .getSession()
      .then((current) => {
        if (active) setSession(current)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Login, logout y refresh del token llegan por acá.
    const unsubscribe = authService.onAuthStateChange((next) => {
      if (!active) return
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext>
  )
}
