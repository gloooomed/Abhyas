interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const sizeMap = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 26, text: 'text-xl' },
  lg: { icon: 32, text: 'text-2xl' },
  xl: { icon: 42, text: 'text-3xl' },
}

// Inline SVG so we can fully control stroke color via CSS
function LogoSVG({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M16.3027,32.1H12.5114L4.5,23.9608,12.4975,15.9h5.0659L9.7656,23.7157l6.8112,6.8267" />
      <path d="M24,19.468,27.3548,38.11h5.4L27.79,9.89H20.21L15.2454,38.11h5.4Z" />
      <path d="M31.4232,30.5424l6.8112-6.8267L30.4366,15.9h5.0659L43.5,23.9608,35.4886,32.1H31.6973" />
    </svg>
  )
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoSVG
        size={iconSize}
        className="stroke-black dark:stroke-white flex-shrink-0"
      />
      {showText && (
        <span className={`font-semibold tracking-tighter text-black dark:text-white ${textSize}`}>
          Abhyas
        </span>
      )}
    </div>
  )
}

export { LogoSVG as LogoIcon }
