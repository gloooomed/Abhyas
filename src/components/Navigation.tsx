import { SignInButton, useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from './Logo'

interface NavigationProps {
  showUserButton?: boolean
  userButtonComponent?: React.ReactNode
}

export default function Navigation({ showUserButton = false, userButtonComponent }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const location = useLocation()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element
      // Check if click is on the button or its children
      const isMenuButton = target.closest('button[data-menu-button]')
      // Check if click is inside the mobile menu
      const isMobileMenuClick = target.closest('[data-mobile-menu]')
      
      if (!isMenuButton && !isMobileMenuClick) {
        setIsMobileMenuOpen(false)
      }
    }

    // Add a small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick)
    }, 100)
    
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [isMobileMenuOpen])

  return (
    <header className="navbar sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to={isSignedIn ? "/dashboard" : "/"} 
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 rounded-lg px-2 py-1 hover:bg-gray-50" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Logo size="md" />
            </Link>
            {showUserButton && (
              <div className="hidden sm:block badge badge-primary text-xs">AI-Powered</div>
            )}
          </div>
          
          {/* Desktop Navigation - Always visible on desktop screens (768px+) */}
          <nav className="nav-desktop items-center space-x-8">
            <Link 
              to="/about" 
              className={`font-medium text-base transition-colors py-2 px-3 rounded-md ${
                location.pathname === '/about' 
                  ? 'text-blue-600' 
                  : 'text-slate-700 hover:text-blue-600'
              }`}
              style={{ textDecoration: 'none' }}
            >
              About Us
            </Link>
            
            {!isSignedIn ? (
              <SignInButton>
                <Button variant="ghost" className="text-slate-700 hover:text-blue-600 font-medium text-base py-2 px-4">
                  Sign In
                </Button>
              </SignInButton>
            ) : (
              showUserButton && userButtonComponent
            )}
          </nav>

          {/* Mobile Menu Button - Only visible on mobile screens (below 768px) */}
          <div className="nav-mobile">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 text-slate-700 hover:text-blue-600 transition-colors rounded-md"
              data-menu-button
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only visible on mobile */}
      {isMobileMenuOpen && (
        <div className="nav-mobile border-t border-gray-200 bg-white shadow-lg" data-mobile-menu>
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col space-y-2">
              {!isSignedIn ? (
                <>
                  <SignInButton>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="text-slate-700 hover:text-blue-600 hover:bg-gray-50 font-medium text-base py-4 px-4 w-full text-center rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <Link 
                    to="/about" 
                    className={`text-base font-medium transition-all duration-200 py-4 px-4 rounded-xl w-full block text-center ${
                      location.pathname === '/about' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-slate-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    style={{ textDecoration: 'none' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  {showUserButton && (
                    <div className="flex justify-center pb-4 px-4">
                      {userButtonComponent}
                    </div>
                  )}
                  <Link 
                    to="/about" 
                    className={`text-base font-medium transition-all duration-200 py-4 px-4 rounded-xl w-full block text-center ${
                      location.pathname === '/about' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-slate-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    style={{ textDecoration: 'none' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}