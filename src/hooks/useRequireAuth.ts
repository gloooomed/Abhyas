import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook to handle authentication requirements across components.
 * Drop-in replacement for the old Clerk-based useRequireAuth.
 */
export function useRequireAuth() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const isSignedIn = !!session
  const isLoaded = !loading

  const requireAuth = useCallback((): boolean => {
    if (!isSignedIn) {
      navigate('/sign-in')
      return false
    }
    return true
  }, [isSignedIn, navigate])

  const redirectToSignIn = useCallback(() => {
    navigate('/sign-in')
  }, [navigate])

  return {
    isSignedIn,
    isLoaded,
    isAuthLoading: loading,
    requireAuth,
    redirectToSignIn,
  }
}

export default useRequireAuth
