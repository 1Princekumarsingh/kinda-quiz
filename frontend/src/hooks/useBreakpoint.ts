import { useEffect, useState } from 'react'

function scheduleBreakpointUpdate(callback: () => void) {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => callback())
    return
  }

  window.setTimeout(callback, 16)
}

/**
 * Breakpoint definitions matching TailwindCSS defaults
 * Mobile: 320px - 767px (default, no prefix)
 * Tablet: 768px - 1023px (md: prefix)
 * Desktop: 1024px - 1279px (lg: prefix)
 * Wide Desktop: 1280px+ (xl: prefix)
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

interface BreakpointConfig {
  mobile: { min: number; max: number }
  tablet: { min: number; max: number }
  desktop: { min: number; max: number }
  wide: { min: number; max: null }
}

const BREAKPOINTS: BreakpointConfig = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 1279 },
  wide: { min: 1280, max: null },
}

/**
 * Determines the current breakpoint based on window width
 */
function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth

  if (width >= BREAKPOINTS.wide.min) return 'wide'
  if (width >= BREAKPOINTS.desktop.min) return 'desktop'
  if (width >= BREAKPOINTS.tablet.min) return 'tablet'
  return 'mobile'
}

/**
 * Hook that returns the current responsive breakpoint
 * 
 * @returns Current breakpoint ('mobile' | 'tablet' | 'desktop' | 'wide')
 * 
 * @example
 * const breakpoint = useBreakpoint()
 * 
 * return (
 *   <div>
 *     {breakpoint === 'mobile' && <MobileNav />}
 *     {breakpoint !== 'mobile' && <DesktopNav />}
 *   </div>
 * )
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(() => {
        setBreakpoint(getCurrentBreakpoint())
        rafId = null
      })
    }

    const debouncedResize = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        handleResize()
        timeoutId = null
      }, 50)
    }

    const handleOrientationChange = () => {
      scheduleBreakpointUpdate(() => setBreakpoint(getCurrentBreakpoint()))
    }

    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return breakpoint
}

/**
 * Hook that checks if the current breakpoint matches the specified one(s)
 * 
 * @param target - Single breakpoint or array of breakpoints to match
 * @returns boolean indicating if current breakpoint matches
 * 
 * @example
 * const isMobile = useBreakpointMatch('mobile')
 * const isMobileOrTablet = useBreakpointMatch(['mobile', 'tablet'])
 */
export function useBreakpointMatch(target: Breakpoint | Breakpoint[]): boolean {
  const currentBreakpoint = useBreakpoint()
  
  if (Array.isArray(target)) {
    return target.includes(currentBreakpoint)
  }
  
  return currentBreakpoint === target
}
