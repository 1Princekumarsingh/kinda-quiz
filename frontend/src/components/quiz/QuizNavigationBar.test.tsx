import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import QuizNavigationBar from './QuizNavigationBar'

describe('QuizNavigationBar', () => {
  it('uses tablet-landscape and desktop-friendly navigation layout classes', () => {
    const { container } = render(
      <QuizNavigationBar
        currentIndex={0}
        totalQuestions={10}
        answeredCount={2}
        isAnswered={false}
        isBookmarked={false}
        canGoPrevious={false}
        canGoNext={true}
        onPrevious={() => {}}
        onNext={() => {}}
        onToggleBookmark={() => {}}
        onTogglePalette={() => {}}
        onSubmit={() => {}}
      />
    )

    const navRow = container.querySelector('.flex.flex-col.gap-3') as HTMLElement
    expect(navRow).toHaveClass('md:landscape:flex-row')
    expect(navRow).toHaveClass('lg:gap-4')
  })
})
