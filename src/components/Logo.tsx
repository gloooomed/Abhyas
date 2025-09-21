import logoImage from '../assets/Logo.jpg'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
}

const LogoIcon = ({ size = 'md', className = '' }: { size?: string, className?: string }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={`${dimensions[size as keyof typeof dimensions]} ${className} relative`}>
      <img 
        src={logoImage} 
        alt="Abhyas Logo" 
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  )
}

export default function Logo({ size = 'md', className = '', showText = true, variant = 'default' }: LogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-4xl'
  }

  const textColors = {
    default: 'gradient-text',
    white: 'text-white',
    dark: 'text-gray-900'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className={`font-bold ${textSizes[size]} ${textColors[variant]}`}>
          Abhyas
        </span>
      )}
    </div>
  )
}

// Export the icon separately for cases where only the icon is needed
export { LogoIcon }