import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex touch-target items-center justify-center rounded-xl font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 hover:scale-105 active:scale-95 transform md:gap-1 md:px-4'

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 hover:shadow-elevated-hover',
    secondary: 'border border-primary-600 bg-white text-primary-700 hover:bg-primary-50 active:bg-primary-100 hover:shadow-elevated',
    tertiary: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 hover:shadow-elevated-hover',
  }

  const sizeClasses = {
    sm: 'min-h-8 px-3 py-1.5 text-sm md:min-h-[44px] md:px-4 md:py-2',
    md: 'min-h-10 px-4 py-2 text-sm md:min-h-[44px] md:px-5 md:py-2.5',
    lg: 'min-h-12 px-6 py-3 text-base md:min-h-[48px] md:px-6 md:py-3',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon && iconPosition === 'left' ? <span>{icon}</span> : null}
          <span>{children}</span>
          {icon && iconPosition === 'right' ? <span>{icon}</span> : null}
        </span>
      )}
    </button>
  )
}
