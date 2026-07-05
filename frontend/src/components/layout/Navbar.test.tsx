import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

const logout = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'Test User' },
    logout,
  }),
}))

vi.mock('./MobileMenu', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => <div data-testid="mobile-menu">{isOpen ? 'open' : 'closed'}</div>,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/dashboard' }),
  }
})

describe('Navbar', () => {
  it('renders a mobile menu toggle that is hidden on large viewports', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: /open navigation menu/i })
    expect(toggle).toHaveClass('md:landscape:hidden')
  })

  it('shows the desktop navigation layout on large viewports', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const desktopNav = screen.getByRole('navigation', { name: /primary navigation/i })
    expect(desktopNav).toHaveClass('hidden')
    expect(desktopNav).toHaveClass('lg:flex')
  })

  it('uses a taller header on large viewports', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('h-14')
    expect(header).toHaveClass('lg:h-16')
  })
})
