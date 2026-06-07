import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const getFirstString = (...values: unknown[]) => values.find((value) => typeof value === 'string' && value.trim().length > 0) as string | undefined

const mapUserToProfile = (user: User): Profile => {
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const identityData = user.identities?.[0]?.identity_data as Record<string, unknown> | undefined
  const fullName = getFirstString(metadata?.full_name, metadata?.name, identityData?.full_name, identityData?.name) ?? null
  const avatarUrl = getFirstString(metadata?.avatar_url, metadata?.picture, identityData?.avatar_url, identityData?.picture) ?? null

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
    created_at: user.created_at ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const syncProfile = async (user: User) => {
    const nextProfile = mapUserToProfile(user)
    const { data } = await supabase
      .from('profiles')
      .upsert({
        id: nextProfile.id,
        email: nextProfile.email,
        full_name: nextProfile.full_name,
        avatar_url: nextProfile.avatar_url,
      }, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    setProfile((data as Profile | null) ?? nextProfile)
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) syncProfile(session.user)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        syncProfile(session.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
