import { useCallback } from 'react'
import { useAuth, useClerk } from '@clerk/clerk-react'

/**
 * Custom hook to handle authentication requirements across components.
 * Extracts the repeated auth checking pattern used throughout the app.
 */
export function useRequireAuth() {
  const { isSignedIn, isLoaded } = useAuth()
  const { redirectToSignIn } = useClerk()

  /**
   * Call this before performing protected actions.
   * Returns true if user is authenticated, false otherwise.
   * Automatically redirects to sign-in if not authenticated.
   */
  const requireAuth = useCallback((): boolean => {
    if (!isSignedIn) {
      redirectToSignIn()
      return false
    }
    return true
  }, [isSignedIn, redirectToSignIn])

  /**
   * Check if auth state is still loading
   */
  const isAuthLoading = !isLoaded

  return {
    isSignedIn: isSignedIn ?? false,
    isLoaded,
    isAuthLoading,
    requireAuth,
    redirectToSignIn,
  }
}

export default useRequireAuth
