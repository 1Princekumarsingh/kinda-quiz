import { useEffect, useMemo, useRef, useState } from 'react'

interface ResponsiveMediaProps {
  src: string
  src2x?: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
}

export default function ResponsiveMedia({
  src,
  src2x,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
}: ResponsiveMediaProps) {
  const [isVisible, setIsVisible] = useState(false)
  const mediaRef = useRef<HTMLDivElement>(null)
  const srcSet = useMemo(() => (src2x ? `${src} 1x, ${src2x} 2x` : src), [src, src2x])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    let isMounted = true
    let observer: IntersectionObserver | null = null
    let rafId: number | null = null

    const startObservation = () => {
      if (!isMounted) return

      observer = new IntersectionObserver(
        (entries) => {
          if (!isMounted) return
          const [entry] = entries
          if (entry?.isIntersecting) {
            setIsVisible(true)
            observer?.disconnect()
          }
        },
        { rootMargin: '160px 0px' }
      )

      const node = mediaRef.current
      if (node) {
        observer.observe(node)
      } else {
        setIsVisible(true)
      }
    }

    if (typeof window.requestAnimationFrame === 'function') {
      rafId = window.requestAnimationFrame(startObservation)
    } else {
      startObservation()
    }

    return () => {
      isMounted = false
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      observer?.disconnect()
    }
  }, [alt])

  return (
    <div ref={mediaRef} className={`mx-auto w-full max-w-[60%] md:max-w-[40%] lg:max-w-[30%] ${className}`.trim()} data-media-anchor={alt}>
      <img
        src={isVisible ? src : ''}
        srcSet={isVisible ? srcSet : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        data-loading={isVisible ? 'loaded' : 'pending'}
        className="h-auto w-full rounded-xl object-cover shadow-sm"
      />
    </div>
  )
}
