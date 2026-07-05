import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QuizConfigModal from './QuizConfigModal'

describe('QuizConfigModal', () => {
  it('uses a desktop two-column layout for related settings', () => {
    render(
      <QuizConfigModal
        isOpen={true}
        onClose={() => {}}
        onStart={vi.fn()}
        chapterQuestionCount={20}
        chapterId={1}
      />
    )

    const form = screen.getByRole('button', { name: /start quiz/i }).closest('form')
    expect(form).toHaveClass('lg:max-w-[600px]')
    expect(form?.querySelector('[class*="lg:grid-cols-2"]')).toBeTruthy()
  })
})
