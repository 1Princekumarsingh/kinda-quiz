import React from 'react'

export interface ContainerProps {
  children: React.ReactNode
  /**
   * Maximum width size variant
   * - sm: 640px
   * - md: 768px
   * - lg: 1024px
   * - xl: 1280px
   * - full: 100% (no max-width constraint)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /**
   * Additional CSS classes to apply
   */
  className?: string
  /**
   * HTML element to render as (default: 'div')
   */
  as?: keyof JSX.IntrinsicElements
}

/**
 * Container component with responsive padding and max-width
 * 
 * Provides consistent horizontal padding and max-width constraints
 * across different viewport sizes:
 * - Mobile: 16px horizontal padding
 * - Tablet: 24px horizontal padding
 * - Desktop: 32px horizontal padding
 * 
 * Prevents horizontal scrolling through overflow-x-hidden
 * 
 * @example
 * // Default medium container
 * <Container>
 *   <h1>Page Content</h1>
 * </Container>
 * 
 * @example
 * // Large container with custom class
 * <Container size="lg" className="py-8">
 *   <div>Wide layout content</div>
 * </Container>
 * 
 * @example
 * // Full width container (no max-width)
 * <Container size="full">
 *   <div>Full width content</div>
 * </Container>
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.7, 1.8
 */
export function Container({
  children,
  size = 'lg',
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  // Map size prop to Tailwind max-width classes for desktop and tablet viewports
  const maxWidthClasses = {
    sm: 'max-w-full lg:max-w-[640px] xl:max-w-[640px]',
    md: 'max-w-full lg:max-w-[768px] xl:max-w-[960px]',
    lg: 'max-w-full lg:max-w-[1024px] xl:max-w-[1200px]',
    xl: 'max-w-full',
    full: 'max-w-full lg:max-w-none xl:max-w-none',
  }

  return (
    <Component
      className={`
        w-full
        mx-auto
        lg:mx-auto
        ${maxWidthClasses[size]}
        px-2 md:px-3 lg:px-4 xl:px-4
        overflow-x-hidden
        transition-all duration-200
        lg:mx-auto
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  )
}
