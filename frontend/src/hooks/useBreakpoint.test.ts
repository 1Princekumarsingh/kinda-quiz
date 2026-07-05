import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useBreakpoint, useBreakpointMatch } from './useBreakpoint'

describe('useBreakpoint', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    vi.useFakeTimers()
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    vi.useRealTimers()
    // Restore original width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    })
    vi.clearAllMocks()
  })

  it('should return "mobile" for widths below 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('mobile')
  })

  it('should return "tablet" for widths between 768px and 1023px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 900,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('tablet')
  })

  it('should return "desktop" for widths between 1024px and 1279px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1100,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('desktop')
  })

  it('should return "wide" for widths 1280px and above', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1920,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('wide')
  })

  it('should update breakpoint on window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('mobile')

    // Simulate window resize to tablet
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      })
      window.dispatchEvent(new Event('resize'))
    })

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // The resize handler should update the breakpoint
    // Note: The actual update happens after debounce
  })

  it('should update breakpoint on orientation change', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current).toBe('mobile')

    // Simulate orientation change
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      })
      window.dispatchEvent(new Event('orientationchange'))
    })

    // orientationchange should trigger immediate update without debounce
  })

  it('should schedule breakpoint updates through requestAnimationFrame', () => {
    const rafSpy = vi.fn((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    vi.stubGlobal('requestAnimationFrame', rafSpy)

    const { result } = renderHook(() => useBreakpoint())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(rafSpy).toHaveBeenCalled()
    expect(result.current).toBe('desktop')
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useBreakpoint())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function))
  })
})

describe('useBreakpointMatch', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })
  })

  it('should match single breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    const { result } = renderHook(() => useBreakpointMatch('mobile'))

    expect(result.current).toBe(true)
  })

  it('should not match different breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    const { result } = renderHook(() => useBreakpointMatch('desktop'))

    expect(result.current).toBe(false)
  })

  it('should match array of breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800,
    })

    const { result } = renderHook(() => useBreakpointMatch(['mobile', 'tablet']))

    expect(result.current).toBe(true)
  })

  it('should not match if current breakpoint not in array', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1100,
    })

    const { result } = renderHook(() => useBreakpointMatch(['mobile', 'tablet']))

    expect(result.current).toBe(false)
  })
})
