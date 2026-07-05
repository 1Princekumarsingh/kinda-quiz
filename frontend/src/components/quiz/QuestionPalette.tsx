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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Question Palette</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-3 hidden gap-2 text-xs text-slate-600 sm:grid sm:grid-cols-2">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full border border-emerald-300 bg-emerald-100"></div><span>Answered</span></div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full border border-violet-300 bg-violet-100"></div><span>Marked</span></div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full border border-rose-300 bg-rose-100"></div><span>Not answered</span></div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-slate-100"></div><span>Not visited</span></div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4 xl:grid-cols-5">
        {state.questions.map((question, index) => {
          const status = getQuestionStatus(index)
          const isCurrent = index === state.current_question_index
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-200 sm:h-10 sm:w-full sm:min-h-[40px] ${getStatusColor(status, isCurrent)} ${isCurrent ? 'ring-2 ring-primary-300 ring-offset-1' : ''}`}
              title={`Question ${question.question_number}`}
            >
              {question.question_number}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Total:</span>
          <span className="font-semibold text-slate-900">{state.questions.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Answered:</span>
          <span className="font-semibold text-emerald-600">
            {Array.from(state.answers.values()).filter(a => a.selected_answer !== null).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Not answered:</span>
          <span className="font-semibold text-rose-600">
            {Array.from(state.answers.values()).filter(a => a.selected_answer === null && a.is_visited).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Marked:</span>
          <span className="font-semibold text-violet-600">
            {Array.from(state.answers.values()).filter(a => a.is_bookmarked).length}
          </span>
        </div>
      </div>
    </div>
  )
}
