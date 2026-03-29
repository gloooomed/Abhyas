import { Github } from 'lucide-react'

interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black py-12 transition-colors ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xl tracking-tighter font-semibold text-black dark:text-white">Abhyas</span>
            <span className="text-slate-500 dark:text-zinc-500 text-sm tracking-tight">&copy; {new Date().getFullYear()} Abhyas.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/gloooomed/Abhyas" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
