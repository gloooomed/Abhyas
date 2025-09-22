import { useAuth, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from './Logo'

interface NavigationProps {
  showUserButton?: boolean
  userButtonComponent?: React.ReactNode
  isAuthPage?: boolean
}

export default function Navigation({ showUserButton = false, userButtonComponent, isAuthPage = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const { user } = useUser()
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
      <div className="container mx-auto px-4 py-0 h-12 flex items-center">
        <div className="flex items-center justify-between w-full">
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
          <nav className="nav-desktop items-center space-x-6">
            {isAuthPage ? (
              <Link 
                to="/" 
                className="font-medium text-base transition-colors py-2 px-3 rounded-md text-slate-700 hover:text-blue-600"
                style={{ textDecoration: 'none' }}
              >
                Back to Home
              </Link>
            ) : (
              <>
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
                  <Link to="/sign-in">
                    <Button variant="ghost" className="text-slate-700 hover:text-blue-600 font-medium text-base py-2 px-3 rounded-md">
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  showUserButton && (
                    <div className="flex items-center gap-3 ml-4">
                      {user && user.firstName && (
                        <span className="text-base font-medium text-slate-700">
                          Hi, {user.firstName}
                        </span>
                      )}
                      <div className="flex items-center">
                        {userButtonComponent}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button - Only visible on mobile screens (below 768px) */}
          <div className="nav-mobile">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-700 hover:text-blue-600 transition-all duration-300 focus:outline-none focus:ring-0 border-0 bg-transparent hover:bg-transparent"
              data-menu-button
              aria-label="Toggle menu"
              style={{ outline: 'none', border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only visible on mobile */}
      {isMobileMenuOpen && (
        <div className="nav-mobile bg-white shadow-lg animate-in slide-in-from-top-2 duration-300 ease-out" data-mobile-menu>
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col space-y-2 animate-in fade-in duration-400 delay-100">
              {isAuthPage ? (
                <Link 
                  to="/" 
                  className="text-base font-medium transition-all duration-200 py-4 px-4 rounded-xl w-full block text-center text-slate-700 hover:text-blue-600 hover:bg-gray-50"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Back to Home
                </Link>
              ) : (
                <>
                  {!isSignedIn ? (
                    <>
                      <Link to="/sign-in">
                        <Button 
                          variant="ghost" 
                          size="lg"
                          className="text-slate-700 hover:text-blue-600 hover:bg-gray-50 font-medium text-base py-4 px-4 w-full text-center rounded-xl transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
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
                        <div className="flex flex-col items-center pb-4 px-4 border-b border-gray-100 mb-2">
                          {user && user.firstName && (
                            <span className="text-base font-medium text-slate-700 mb-3">
                              Hi, {user.firstName}!
                            </span>
                          )}
                          <div className="flex justify-center">
                            {userButtonComponent}
                          </div>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}