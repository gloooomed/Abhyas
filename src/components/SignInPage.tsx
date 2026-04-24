import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from './Navigation'
import Footer from './ui/Footer'

export default function SignInPage() {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      <Navigation isAuthPage={true} />

      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-[400px]">

          {/* Header */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-semibold tracking-tighter mb-3">Welcome back.</h1>
            <p className="text-slate-500 dark:text-zinc-400 tracking-tight text-sm">
              Sign in to continue to Abhyas.
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sutera-card p-8">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 mb-6">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 tracking-tight">{error}</p>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-sm font-medium tracking-tight hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* Fine print */}
              <p className="text-center text-xs text-slate-400 dark:text-zinc-600 tracking-tight mt-6 leading-relaxed">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}