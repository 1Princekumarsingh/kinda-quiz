import { ReactNode, useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  preventClose?: boolean
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  preventClose = false,
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        event.preventDefault()
        onClose()
      }

      if (event.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocusedElement.current?.focus()
    }
  }, [isOpen, onClose, preventClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'lg:max-w-[400px]',
    md: 'lg:max-w-[600px]',
    lg: 'lg:max-w-[800px]',
    full: 'w-full h-full max-h-screen rounded-none',
  }

  const isFullScreen = size === 'full' || (typeof window !== 'undefined' && window.innerWidth < 768)

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-0 animation-pulse sm:items-center sm:p-4 animate-fade-in" onClick={() => { if (!preventClose) onClose() }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-0 flex max-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl animate-modal-open sm:my-0 ${isFullScreen ? 'h-full max-w-none' : `md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:rounded-lg md:shadow-xl md:max-h-[90vh] lg:w-auto ${sizeClasses[size]} max-h-[calc(100vh-2rem)]`}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold leading-tight text-gray-900 md:text-xl lg:text-2xl">{title}</h2>
          {showCloseButton ? (
            <button
              type="button"
              onClick={() => { if (!preventClose) onClose() }}
              className="touch-target flex items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
