interface QuizNavigationBarProps {
  currentIndex: number
  totalQuestions: number
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
  isAnswered,
  isBookmarked,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onToggleBookmark,
  onTogglePalette,
  onSubmit
}: QuizNavigationBarProps) {
  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
            <div className="flex items-center justify-center">
              <button
                onClick={onToggleBookmark}
                className={`p-2 rounded-lg border-2 transition-all ${
                  isBookmarked
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Mark for review'}
              >
                <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            <button
              onClick={onTogglePalette}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              title="View question palette"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden md:inline">Palette</span>
              </div>
            </button>

            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Submit Quiz
            </button>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">
              {currentIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>
              {isAnswered ? (
                <span className="text-green-600 font-medium">✓ Answered</span>
              ) : (
                <span className="text-gray-500">Not answered</span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
