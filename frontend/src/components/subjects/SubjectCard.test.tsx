import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SubjectCard from './SubjectCard'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('SubjectCard', () => {
  const subject = {
    id: '1',
    name: 'Biology',
    chapter_count: 3,
    question_count: 15,
    completion_percentage: 60,
    created_at: '2024-01-01T00:00:00.000Z',
  }

  it('renders the mobile layout by default', () => {
    render(
      <MemoryRouter>
        <SubjectCard subject={subject as never} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getAllByText('Biology').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /edit subject/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /delete subject/i }).length).toBeGreaterThan(0)
  })

  it('renders the desktop layout structure for large viewports', () => {
    render(
      <MemoryRouter>
        <SubjectCard subject={subject as never} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>
    )

    const card = screen.getAllByRole('button')[0]
    const desktopLayout = card.querySelector('.hidden.lg\\:flex')
    expect(desktopLayout).toBeTruthy()
  })

  it('renders icon-only actions for the card actions', () => {
    render(
      <MemoryRouter>
        <SubjectCard subject={subject as never} onEdit={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>
    )

    const buttons = screen.getAllByRole('button', { name: /edit subject/i })
    expect(buttons[0]).toHaveClass('w-9')
    expect(buttons[0]).toHaveAttribute('aria-label', 'Edit subject')
    expect(screen.getAllByRole('button', { name: /delete subject/i })[0]).toHaveAttribute('aria-label', 'Delete subject')
  })
})
