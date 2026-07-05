import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import History from './History'

const mockUseQuery = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}))

describe('History', () => {
  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      data: {
        total: 1,
        data: [
          {
            id: 1,
            quiz_date: '2024-01-01T00:00:00.000Z',
            chapter_id: 2,
            chapter_name: 'Biology',
            mode: 'practice',
            time_taken: 90,
            correct: 4,
            wrong: 1,
            accuracy: 80,
          },
        ],
      },
      isLoading: false,
    })
  })

  it('renders a desktop table with sortable headers for history entries', () => {
    render(<History />)

    expect(screen.getByRole('button', { name: /sort by date/i })).toBeTruthy()
    expect(screen.getByTestId('history-desktop-table')).toHaveClass('hidden')
    expect(screen.getByTestId('history-desktop-table')).toHaveClass('lg:block')
  })
})
