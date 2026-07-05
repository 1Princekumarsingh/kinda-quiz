import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ResponsiveMedia from './ResponsiveMedia'

describe('ResponsiveMedia', () => {
  it('applies responsive sizing and lazy-loading attributes for tablet and desktop viewports', () => {
    render(
      <ResponsiveMedia
        src="/illustrations/subject.jpg"
        src2x="/illustrations/subject@2x.jpg"
        alt="Subject illustration"
      />
    )

    const wrapper = screen.getByAltText('Subject illustration').parentElement
    expect(wrapper).toHaveClass('w-full')
    expect(wrapper).toHaveClass('max-w-[60%]')
    expect(wrapper).toHaveClass('md:max-w-[40%]')
    expect(wrapper).toHaveClass('lg:max-w-[30%]')

    const image = screen.getByAltText('Subject illustration')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('decoding', 'async')
    expect(image).toHaveAttribute('srcset', '/illustrations/subject.jpg 1x, /illustrations/subject@2x.jpg 2x')
  })

  it('defers image loading until the media enters the viewport', () => {
    const observe = vi.fn()

    class MockIntersectionObserver {
      constructor(_callback: IntersectionObserverCallback) {}
      observe = observe
      disconnect = vi.fn()
      unobserve = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    render(<ResponsiveMedia src="/illustrations/subject.jpg" alt="Subject illustration" />)

    const image = screen.getByAltText('Subject illustration')
    expect(image).toHaveAttribute('data-loading', 'pending')
    expect(image).toHaveAttribute('src', '')
    expect(observe).toHaveBeenCalled()
  })

  it('defers observer setup until the next animation frame for smoother initial render', () => {
    const observe = vi.fn()
    const rafSpy = vi.fn((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    class MockIntersectionObserver {
      constructor(_callback: IntersectionObserverCallback) {}
      observe = observe
      disconnect = vi.fn()
      unobserve = vi.fn()
    }

    vi.stubGlobal('requestAnimationFrame', rafSpy)
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    render(<ResponsiveMedia src="/illustrations/subject.jpg" alt="Subject illustration" />)

    expect(rafSpy).toHaveBeenCalled()
    expect(observe).toHaveBeenCalled()
  })
})
