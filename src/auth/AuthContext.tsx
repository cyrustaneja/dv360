import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, type Me } from '../lib/api'

interface AuthState {
  loading: boolean
  me: Me | null
  role: Me['role'] | null
  isStaff: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

/**
 * Identity comes from the Kraftshala Hub via the session cookie set at /api/sso.
 * There is NO local login — the app only learns who you are by calling /api/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    let active = true
    api.me()
      .then((m) => { if (active) setMe(m) })
      .catch(() => { if (active) setMe(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const signOut = useCallback(async () => {
    await api.logout()
    setMe(null)
    // Send them back to the hub if we know it; otherwise reload to the launch page.
    window.location.href = '/'
  }, [])

  const role = me?.role ?? null
  const value: AuthState = {
    loading,
    me,
    role,
    isStaff: role === 'admin' || role === 'expert',
    isAdmin: role === 'admin',
    signOut,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
