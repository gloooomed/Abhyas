import { memo } from 'react'
import { Github } from 'lucide-react'

interface FooterProps {
  className?: string
}

/**
 * Memoized footer component shared across all pages.
 * Since footer content is static, memoization prevents unnecessary re-renders.
 */
const Footer = memo(function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`border-t border-gray-200 py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center">
            <span className="text-slate-600 text-sm">
              &copy; {currentYear} Abhyas. All rights reserved.
            </span>
          </div>
          <div className="flex items-center">
            <a
              href="https://github.com/gloooomed/Abhyas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-600 transition-colors"
              aria-label="View project on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})

export default Footer
