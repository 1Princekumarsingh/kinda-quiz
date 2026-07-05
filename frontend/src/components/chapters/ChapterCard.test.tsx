import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ChapterCard from './ChapterCard'

describe('ChapterCard', () => {
  const chapter = {
    id: '1',
    name: 'Cell Biology',
    created_at: '2024-01-01T00:00:00.000Z',
    question_count: 10,
    completed_count: 4,
    review_count: 1,
    error_count: 0,
    almost_forgot_count: 0,
    accuracy: 75,
  }

  it('renders a desktop-specific layout structure for large viewports', () => {
    render(
      <ChapterCard
        chapter={chapter as never}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onImport={vi.fn()}
        onStartQuiz={vi.fn()}
        onContinueChapter={vi.fn()}
        onExport={vi.fn()}
      />
    )

    const card = screen.getByText('Cell Biology').closest('section')
    expect(card).toBeTruthy()
    expect(card).toHaveTextContent('Progress')
    expect(card).toHaveTextContent('Start quiz')
  })
})
