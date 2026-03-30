import logoGif from '../assets/a.gif'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const sizeMap = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 42, text: 'text-2xl' },
  xl: { icon: 56, text: 'text-3xl' },
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 
        The GIF is animated.
        In dark mode: render as-is (assumes GIF has white/bright content).
        In light mode: apply invert so it looks good on white backgrounds.
        Adjust the class below if your GIF is already dark-friendly on both modes.
      */}
      <img
        src={logoGif}
        alt="Abhyas logo"
        width={iconSize}
        height={iconSize}
        className="flex-shrink-0 dark:invert-0 invert rounded-sm"
        style={{ objectFit: 'contain' }}
      />
      {showText && (
        <span className={`font-semibold tracking-tighter text-black dark:text-white ${textSize}`}>
          Abhyas
        </span>
      )}
    </div>
  )
}

// Keep backward compat export used by other components
export function LogoIcon({ size = 26 }: { size?: number; className?: string }) {
  return (
    <img
      src={logoGif}
      alt="Abhyas logo"
      width={size}
      height={size}
      className="flex-shrink-0 dark:invert-0 invert rounded-sm"
      style={{ objectFit: 'contain' }}
    />
  )
}