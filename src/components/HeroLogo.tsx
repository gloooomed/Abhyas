import logoImage from '../assets/Logo.jpg'

interface HeroLogoProps {
  className?: string
  showTagline?: boolean
}

export default function HeroLogo({ className = '', showTagline = true }: HeroLogoProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <img 
          src={logoImage} 
          alt="Abhyas Logo" 
          className="w-48 h-28 object-contain rounded-lg shadow-lg"
        />
      </div>
      
      <h1 className="text-6xl md:text-7xl font-extrabold gradient-text mb-4">
        Abhyas
      </h1>
      
      {showTagline && (
        <p className="text-2xl md:text-3xl text-slate-600 font-medium">
          AI Powered Career and Skill Advisor
        </p>
      )}
    </div>
  )
}