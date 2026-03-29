import { useAuth, useUser, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import Logo from './Logo'

interface NavigationProps {
  showUserButton?: boolean
  userButtonComponent?: React.ReactNode
  isAuthPage?: boolean
}

export default function Navigation({ showUserButton = false, userButtonComponent, isAuthPage = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: 'About Us', href: '/about' },
  ]

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center">
            <Link to={isSignedIn ? '/dashboard' : '/'} className="flex items-center">
              <Logo size="md" showText={true} />
            </Link>
          </div>


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
            
            {showUserButton && user && (
              <span className="text-sm tracking-tight text-slate-600 dark:text-slate-400">
                Hi, <span className="text-black dark:text-white font-medium">{user.firstName}</span>
              </span>
            )}
            
            <ThemeToggle />

            {!isAuthPage && (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-zinc-800">
                {!isSignedIn ? (
                  <>
                    <Link to="/sign-in">
                      <Button variant="ghost" className="rounded-full text-black hover:bg-slate-100 dark:text-white dark:hover:bg-zinc-800">Sign In</Button>
                    </Link>
                    <Link to="/sign-up">
                      <Button className="sutera-button">Get Started</Button>
                    </Link>
                  </>
                ) : (
                  userButtonComponent ?? <UserButton afterSignOutUrl="/" />
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            {!isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full dark:text-white"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && !isAuthPage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-black"
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
                  <div className="flex flex-col space-y-3 px-3">
                    <Link to="/sign-in" className="w-full">
                      <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-zinc-700 dark:text-white">Sign In</Button>
                    </Link>
                    <Link to="/sign-up" className="w-full">
                      <Button className="w-full sutera-button">Get Started</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Signed in as {user?.firstName}
                    </span>
                    {userButtonComponent ?? <UserButton afterSignOutUrl="/" />}
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