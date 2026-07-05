import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
}

export default function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'rounded-2xl border border-gray-200 bg-white transition-all duration-150'
  const variantClasses = {
    elevated: 'shadow-sm',
    outlined: 'shadow-none',
    flat: 'border-transparent bg-transparent shadow-none',
  }
  const paddingClasses = {
    sm: 'p-4 md:p-4 lg:p-3 xl:p-3',
    md: 'p-5 md:p-5 lg:p-4 xl:p-4',
    lg: 'p-6 md:p-6 lg:p-4 xl:p-4',
  }
  const interactiveClasses = hoverable
    ? 'cursor-pointer lg:hover:scale-[1.02] lg:hover:shadow-elevated-hover active:scale-95 transform xl:hover:scale-[1.03]'
    : ''
  const interactiveAttrs = onClick ? { role: 'button', tabIndex: 0, onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick() } } } : {}

  return (
    <section
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`.trim()}
      onClick={onClick}
      {...interactiveAttrs}
      {...props}
    >
      {children}
    </section>
  )
}
