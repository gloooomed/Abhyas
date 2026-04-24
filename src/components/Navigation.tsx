import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, User, History } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import Logo from './Logo'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface NavigationProps {
  isAuthPage?: boolean
}

export default function Navigation({ isAuthPage = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { session, profile } = useAuth()
  const isSignedIn = !!session
  const userMenuRef = useRef<HTMLDivElement>(null)

  const avatarUrl = profile?.avatar_url
  const displayName = profile?.full_name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? 'User'
  const fullName = profile?.full_name ?? displayName
  const email = profile?.email ?? session?.user?.email ?? ''

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      window.location.href = '/'
    }
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsMobileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const navLinks = [{ name: 'About Us', href: '/about' }]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link to={isSignedIn ? '/dashboard' : '/'} className="flex items-center">
              <Logo size="md" showText={true} />
            </Link>
          </div>

          {/* ── Desktop nav ──────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <ThemeToggle />

            {!isAuthPage && (
              <div className="flex items-center pl-4">
                {!isSignedIn ? (
                  <Link to="/sign-in">
                    <Button className="sutera-button">Get Started</Button>
                  </Link>
                ) : (
                  /* ── Inline user menu (no sub-component) ── */
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(prev => !prev)}
                      className="flex items-center gap-2.5 rounded-full hover:opacity-80 transition-opacity focus:outline-none"
                      aria-label="User menu"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-zinc-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                          <span className="text-xs font-semibold text-white dark:text-black">{displayName[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium tracking-tight hidden sm:block">{displayName}</span>
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50"
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                            <p className="text-sm font-semibold tracking-tight truncate">{fullName}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-500 tracking-tight truncate">{email}</p>
                          </div>

                          {/* Links */}
                          <div className="py-1.5">
                            <Link
                              to="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm tracking-tight hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <User className="h-4 w-4 text-slate-400" />
                              Dashboard
                            </Link>
                            <Link
                              to="/history"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm tracking-tight hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <History className="h-4 w-4 text-slate-400" />
                              History
                            </Link>
                          </div>

                          {/* Sign out */}
                          <div className="border-t border-slate-100 dark:border-zinc-800 py-1.5">
                            <button
                              type="button"
                              onClick={handleSignOut}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm tracking-tight text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* ── Mobile controls ──────────────────────────────────────────── */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            {!isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="rounded-full dark:text-white"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && !isAuthPage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                {!isSignedIn ? (
                  <div className="px-3">
                    <Link to="/sign-in" className="w-full">
                      <Button className="w-full sutera-button">Get Started</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="px-3 space-y-1">
                    {/* Mobile user info */}
                    <div className="flex items-center gap-3 px-3 py-3 mb-2">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-white dark:text-black">{displayName[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight truncate">{fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm tracking-tight text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900">
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm tracking-tight text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900">
                      <History className="h-4 w-4" /> History
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm tracking-tight text-red-500 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}