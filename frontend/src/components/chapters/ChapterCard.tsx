import { Chapter } from '@/types/chapter'
import { QuizProgress } from '@/types/quiz-progress'

interface ChapterCardProps {
  chapter: Chapter
  progress?: QuizProgress | null
  onEdit: (chapter: Chapter) => void
  onDelete: (chapter: Chapter) => void
  onImport: (chapter: Chapter) => void
  onStartQuiz: (chapter: Chapter) => void
  onContinueChapter: (chapter: Chapter, progress?: QuizProgress | null) => void
  onExport: (chapter: Chapter) => void
}

export default function ChapterCard({ chapter, progress, onEdit, onDelete, onImport, onStartQuiz, onContinueChapter, onExport }: ChapterCardProps) {
  const hasProgress = Boolean(progress && !progress.state.is_completed)
  const nextQuestion = progress ? Math.min(progress.state.current_question_index + 1, chapter.question_count) : 0
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
          {chapter.name}
        </h3>
        <div className="flex space-x-2">
          {chapter.question_count > 0 && (
            <button
              onClick={() => onExport(chapter)}
              className="text-gray-400 hover:text-green-600 transition-colors p-1"
              aria-label="Export questions"
              title="Export questions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEdit(chapter)}
            className="text-gray-400 hover:text-primary-600 transition-colors p-1"
            aria-label="Edit chapter"
            title="Edit chapter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(chapter)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            aria-label="Delete chapter"
            title="Delete chapter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Questions</span>
          <span className="font-semibold text-gray-900">{chapter.question_count}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Completed</span>
          <span className="font-semibold text-green-600">{chapter.completed_count}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className="font-semibold text-blue-600">{chapter.remaining_count}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Accuracy</span>
          <span className={`font-semibold ${getAccuracyColor(chapter.accuracy)}`}>
            {chapter.accuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Status Breakdown */}
      {(chapter.review_count > 0 || chapter.error_count > 0 || chapter.almost_forgot_count > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Status Breakdown</div>
          <div className="space-y-2">
            {chapter.review_count > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Review</span>
                <span className="font-semibold text-yellow-600">{chapter.review_count}</span>
              </div>
            )}
            {chapter.almost_forgot_count > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Almost Forgot</span>
                <span className="font-semibold text-orange-600">{chapter.almost_forgot_count}</span>
              </div>
            )}
            {chapter.error_count > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Errors</span>
                <span className="font-semibold text-red-600">{chapter.error_count}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {chapter.question_count > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((chapter.completed_count / chapter.question_count) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((chapter.completed_count / chapter.question_count) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Continue Chapter Button - Show if there's saved progress */}
        {hasProgress && chapter.question_count > 0 && (
          <button
            onClick={() => onContinueChapter(chapter, progress)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>Continue from Question {nextQuestion}</span>
          </button>
        )}
        
        {/* Start Quiz and Import Buttons */}
        <div className="flex space-x-2">
          {chapter.question_count > 0 && (
            <button
              onClick={() => onStartQuiz(chapter)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Quiz</span>
            </button>
          )}
          <button
            onClick={() => onImport(chapter)}
            className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center justify-center space-x-1 ${
              chapter.question_count > 0 ? 'flex-1' : 'w-full'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Import Questions</span>
          </button>
        </div>
      </div>

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Created {formatDate(chapter.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
