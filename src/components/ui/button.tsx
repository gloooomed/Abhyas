import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    let buttonClasses = 'btn '
    
    switch (variant) {
      case 'outline':
        buttonClasses += 'btn-outline '
        break
      case 'secondary':
        buttonClasses += 'btn-secondary '
        break
      case 'ghost':
        buttonClasses += 'btn-ghost '
        break
      default:
        buttonClasses += 'btn-primary '
    }
    
    switch (size) {
      case 'sm':
        buttonClasses += 'btn-sm '
        break
      case 'lg':
        buttonClasses += 'btn-lg '
        break
      case 'icon':
        buttonClasses += 'w-9 h-9 '
        break
    }
    
    return (
      <Comp
        className={buttonClasses + className}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }