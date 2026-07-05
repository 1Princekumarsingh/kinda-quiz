import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import DesktopNav from './DesktopNav'
import MobileMenu from './MobileMenu'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Subjects', path: '/subjects' },
  { label: 'History', path: '/history' },
  { label: 'Statistics', path: '/statistics' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b border-gray-200 bg-white/95 backdrop-blur lg:h-16">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="touch-target flex items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 md:landscape:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-xl font-semibold tracking-tight text-primary-600">RecallX</span>
          </div>

          <div className="hidden md:landscape:flex md:landscape:items-center md:landscape:gap-4">
            <DesktopNav navigationItems={navigationItems} currentPath={location.pathname} />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-700 md:landscape:flex">
              <span>Welcome,</span>
              <span className="font-semibold text-gray-900">{user?.username}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="hidden touch-target rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 md:landscape:inline-flex"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} navigationItems={navigationItems} />
    </>
  )
}
