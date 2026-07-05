interface QuizNavigationBarProps {
  currentIndex: number
  totalQuestions: number
  answeredCount: number
  isAnswered: boolean
  isBookmarked: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  onToggleBookmark: () => void
  onTogglePalette: () => void
  onSubmit: () => void
}

export default function QuizNavigationBar({
  currentIndex,
  totalQuestions,
  answeredCount,
  isBookmarked,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onToggleBookmark,
  onTogglePalette,
  onSubmit
}: QuizNavigationBarProps) {
  const completionPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  return (
    <div className="border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-7xl px-2 py-2 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between md:landscape:flex-row lg:gap-4">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px] sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
            title="Previous question"
          >
            <svg className="h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 lg:gap-3">
            <button
              onClick={onToggleBookmark}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all sm:min-h-[44px] sm:w-auto sm:rounded-xl sm:px-3 sm:py-2 ${
                isBookmarked
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Mark for review'}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <button
              onClick={onTogglePalette}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 sm:min-h-[44px] sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
              title="View question palette"
            >
              <svg className="h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Palette</span>
            </button>

            <button
              onClick={onSubmit}
              className="hidden h-9 w-9 rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 sm:inline-flex sm:min-h-[44px] sm:w-auto sm:items-center sm:justify-center sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2 sm:text-sm sm:font-semibold"
              title="Submit quiz"
            >
              Submit
            </button>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px] sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
            title={currentIndex === totalQuestions - 1 ? 'Submit quiz' : 'Next question'}
          >
            <svg className="h-5 w-5 flex-shrink-0 sm:order-2 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hidden sm:inline">{currentIndex === totalQuestions - 1 ? 'Submit' : 'Next'}</span>
          </button>
        </div>

        <div className="mt-2 sm:mt-4">
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Q{currentIndex + 1}/{totalQuestions}</span>
            <span>{answeredCount}/{totalQuestions} • {completionPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 sm:h-2.5">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300" style={{ width: `${Math.min((currentIndex + 1) / totalQuestions * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
