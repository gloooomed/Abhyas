import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from './ui/LoadingSpinner'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.search).then(() => {
      navigate('/dashboard', { replace: true })
    }).catch(() => {
      navigate('/sign-in', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <LoadingSpinner size="lg" text="Signing you in..." />
    </div>
  )
}
