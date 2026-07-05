import { useEffect, useRef } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationItem {
  label: string
  path: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavigationItem[]
}

export default function MobileMenu({ isOpen, onClose, navigationItems }: MobileMenuProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [location.pathname, onClose, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-250 ease-out animate-[slideInLeft_250ms_ease-out]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <Link 
            to="/dashboard" 
            onClick={onClose}
            className="text-lg font-semibold text-gray-900 transition-colors hover:text-primary-600"
            aria-label="Go to dashboard"
          >
            RecallX
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile navigation links">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-3 py-4">
          <div className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">Logged in as</div>
            <div className="font-semibold text-gray-900">{user?.username}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              onClose()
            }}
            className="w-full touch-target rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
