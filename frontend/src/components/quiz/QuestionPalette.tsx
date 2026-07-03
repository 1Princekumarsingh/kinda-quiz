import { QuizState } from '@/types/quiz'

interface QuestionPaletteProps {
  state: QuizState
  onQuestionSelect: (index: number) => void
  onClose?: () => void
}

export default function QuestionPalette({ state, onQuestionSelect, onClose }: QuestionPaletteProps) {
  const getQuestionStatus = (index: number) => {
    const question = state.questions[index]
    const answer = state.answers.get(question.id)
    
    if (!answer) return 'not_visited'
    
    if (answer.is_bookmarked && answer.selected_answer) return 'marked'
    if (answer.is_bookmarked) return 'marked'
    if (answer.selected_answer) return 'answered'
    if (answer.is_visited) return 'unanswered'
    return 'not_visited'
  }

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-primary-600 text-white border-primary-600'
    
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
      case 'marked':
        return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
      case 'unanswered':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
      case 'not_visited':
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Question Palette</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border-2 bg-green-100 border-green-300"></div>
          <span className="text-gray-700">Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border-2 bg-purple-100 border-purple-300"></div>
          <span className="text-gray-700">Marked for Review</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border-2 bg-red-100 border-red-300"></div>
          <span className="text-gray-700">Not Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border-2 bg-gray-100 border-gray-300"></div>
          <span className="text-gray-700">Not Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded border-2 bg-primary-600 border-primary-600"></div>
          <span className="text-gray-700">Current Question</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2">
        {state.questions.map((question, index) => {
          const status = getQuestionStatus(index)
          const isCurrent = index === state.current_question_index
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`
                w-full aspect-square rounded border-2 font-semibold text-sm
                transition-all duration-200
                ${getStatusColor(status, isCurrent)}
                ${isCurrent ? 'ring-2 ring-primary-300 ring-offset-2' : ''}
              `}
              title={`Question ${question.question_number}`}
            >
              {question.question_number}
            </button>
          )
        })}
      </div>

      {/* Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">{state.questions.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Answered:</span>
          <span className="font-semibold text-green-600">
            {Array.from(state.answers.values()).filter(a => a.selected_answer !== null).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Not Answered:</span>
          <span className="font-semibold text-red-600">
            {Array.from(state.answers.values()).filter(a => a.selected_answer === null && a.is_visited).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Marked:</span>
          <span className="font-semibold text-purple-600">
            {Array.from(state.answers.values()).filter(a => a.is_bookmarked).length}
          </span>
        </div>
      </div>
    </div>
  )
}
