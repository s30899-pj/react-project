import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { uid } from '@/lib/ids'
import { registerKnownUser } from '@/api/userStore'

const STORAGE_KEY = 'mapforge:user'

export interface RegisterInput {
  email: string
  password: string
  displayName: string
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithProvider: (provider: 'google' | 'github' | 'discord') => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  updateProfile: (patch: Partial<Omit<User, 'id' | 'preferences'>>) => void
  updatePreferences: (patch: Partial<User['preferences']>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function roleFromEmail(email: string): UserRole {
  if (email.includes('admin')) return 'admin'
  if (email.includes('test')) return 'tester'
  return 'creator'
}

function buildUser(email: string, displayName?: string): User {
  return {
    id: uid('user'),
    email,
    displayName: displayName ?? email.split('@')[0],
    avatar: '🦊',
    bio: '',
    role: roleFromEmail(email),
    preferences: { theme: 'dark', showGrid: true, snapToGrid: true, autosave: true },
  }
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      registerKnownUser(user)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (email: string, _password: string) => {
    setLoading(true)
    await delay(600)
    const next = buildUser(email)
    setUser(next)
    setLoading(false)
    return next
  }, [])

  const loginWithProvider = useCallback(async (provider: 'google' | 'github' | 'discord') => {
    setLoading(true)
    await delay(700)
    const next = buildUser(`${provider}-user@${provider}.com`, `Użytkownik ${provider}`)
    setUser(next)
    setLoading(false)
    return next
  }, [])

  const register = useCallback(async ({ email, displayName }: RegisterInput) => {
    setLoading(true)
    await delay(700)
    const next = buildUser(email, displayName)
    setUser(next)
    setLoading(false)
    return next
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const updateProfile = useCallback((patch: Partial<Omit<User, 'id' | 'preferences'>>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const updatePreferences = useCallback((patch: Partial<User['preferences']>) => {
    setUser((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, ...patch } } : prev,
    )
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      loginWithProvider,
      register,
      logout,
      updateProfile,
      updatePreferences,
    }),
    [user, loading, login, loginWithProvider, register, logout, updateProfile, updatePreferences],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.displayName = 'AuthProvider'
