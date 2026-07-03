import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QuizState, QuizQuestion } from '@/types/quiz'
import { quizProgressApi } from '@/api/quiz-progress'
import { deserializeQuizState } from '@/lib/quizProgress'

interface ExtendedQuizQuestion extends QuizQuestion {
  explanation?: string
}

export default function QuizReview() {
  const navigate = useNavigate()
  const { chapterId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionKey = searchParams.get('session_key') || ''
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [reviewIndex, setReviewIndex] = useState(0)

  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['quizProgress', sessionKey],
    queryFn: () => quizProgressApi.get(sessionKey),
    enabled: Boolean(sessionKey),
    retry: false
  })

  useEffect(() => {
    const stateFromLocation = location.state?.quizState as QuizState | undefined
    const resolvedState = stateFromLocation || (sessionKey && progressData ? deserializeQuizState(progressData.state) : undefined)

    if (!resolvedState) {
      if (sessionKey && isProgressLoading) return
      navigate(`/chapters/${chapterId}`)
      return
    }

    setQuizState(resolvedState)
  }, [location.state, navigate, chapterId, sessionKey, progressData, isProgressLoading])

  const handleBackToResults = () => {
    const params = new URLSearchParams()
    if (sessionKey) {
      params.set('session_key', sessionKey)
    }
    navigate(`/quiz/results/${chapterId}${params.toString() ? `?${params.toString()}` : ''}`, {
      state: { quizState }
    })
  }

  const handleNextQuestion = () => {
    if (quizState && reviewIndex < quizState.questions.length - 1) {
      setReviewIndex(reviewIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1)
    }
  }

  if (!quizState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = quizState.questions[reviewIndex] as ExtendedQuizQuestion
  const currentAnswer = quizState.answers.get(currentQuestion.id)
  
  if (!currentAnswer) return null

  const isCorrect = currentAnswer.selected_answer === currentQuestion.correct_answer
  const isAnswered = currentAnswer.selected_answer !== null

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Answer Review</h1>
            <p className="mt-1 text-gray-600">
              Question {reviewIndex + 1} of {quizState.questions.length}
            </p>
          </div>
          <button
            onClick={handleBackToResults}
            className="text-gray-600 hover:text-gray-900"
            title="Back to Results"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Status Badge */}
          <div className={`px-6 py-3 border-b ${
            !isAnswered 
              ? 'bg-yellow-50 border-yellow-200' 
              : isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!isAnswered ? (
                  <>
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-yellow-800">Not Answered</span>
                  </>
                ) : isCorrect ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-800">Correct Answer</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-red-800">Wrong Answer</span>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Time spent: {currentAnswer.time_spent}s
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            {/* Question Number and Text */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Question {currentQuestion.question_number}
              </h2>
              <p className="text-lg text-gray-900 leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {options.map((option) => {
                const isUserAnswer = currentAnswer.selected_answer === option.key
                const isCorrectAnswer = currentQuestion.correct_answer === option.key
                
                let optionStyle = 'border-gray-200 bg-white'
                
                if (isCorrectAnswer && isUserAnswer) {
                  optionStyle = 'border-green-500 bg-green-50 ring-2 ring-green-200'
                } else if (isCorrectAnswer) {
                  optionStyle = 'border-green-500 bg-green-50'
                } else if (isUserAnswer) {
                  optionStyle = 'border-red-500 bg-red-50 ring-2 ring-red-200'
                }

                return (
                  <div
                    key={option.key}
                    className={`p-4 rounded-lg border-2 ${optionStyle}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm
                        ${isCorrectAnswer && isUserAnswer
                          ? 'border-green-600 bg-green-600 text-white'
                          : isCorrectAnswer
                            ? 'border-green-600 text-green-600'
                            : isUserAnswer
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-gray-300 text-gray-600'
                        }
                      `}>
                        {option.key}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-900">{option.text}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {isUserAnswer && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              Your Answer
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Explanation Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Explanation</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  The correct answer is <span className="font-semibold">{currentQuestion.correct_answer}</span>.
                  {!isAnswered && (
                    <span className="block mt-2 text-gray-600">You did not answer this question.</span>
                  )}
                  {isAnswered && !isCorrect && (
                    <span className="block mt-2 text-gray-600">
                      You selected <span className="font-semibold">{currentAnswer.selected_answer}</span>.
                    </span>
                  )}
                </p>
                {currentQuestion.explanation ? (
                  <p className="mt-2 text-gray-700 font-medium">
                    {currentQuestion.explanation}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    No detailed explanation available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={reviewIndex === 0}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              reviewIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              {reviewIndex + 1} / {quizState.questions.length}
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={reviewIndex === quizState.questions.length - 1}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              reviewIndex === quizState.questions.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Back to Results */}
        <div className="mt-6 text-center">
          <button
            onClick={handleBackToResults}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    </div>
  )
}
