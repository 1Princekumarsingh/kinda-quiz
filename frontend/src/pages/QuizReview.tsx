import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QuizState, QuizQuestion } from '@/types/quiz'
import { quizProgressApi } from '@/api/quiz-progress'
import { deserializeQuizState } from '@/lib/quizProgress'
import { Accordion } from '@/components/common'
import ReviewExplanation from '@/components/quiz/ReviewExplanation'

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
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
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
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Answer Review</h1>
            <p className="mt-1 text-gray-600">Review your answers and explanations</p>
          </div>
          <button
            onClick={handleBackToResults}
            className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            title="Back to Results"
            aria-label="Close review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Question Card */}
        <section aria-labelledby="review-question-heading" className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Status Badge - Enhanced Styling */}
          <div className={`px-6 py-4 border-b ${
            !isAnswered 
              ? 'bg-yellow-50 border-yellow-200' 
              : isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-3">
                {!isAnswered ? (
                  <>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-bold text-yellow-900">Unanswered</span>
                      <span className="text-sm text-yellow-700">You skipped this question</span>
                    </div>
                  </>
                ) : isCorrect ? (
                  <>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-bold text-green-900">Correct!</span>
                      <span className="text-sm text-green-700">Great job on this question</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-bold text-red-900">Incorrect</span>
                      <span className="text-sm text-red-700">Review the correct answer below</span>
                    </div>
                  </>
                )}
              </div>
              <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                Time spent: {currentAnswer.time_spent}s
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            {/* Question Number and Text */}
            <div className="mb-6">
              <h2 id="review-question-heading" className="mb-2 text-sm font-semibold text-gray-500">
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
                        flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold
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
            {currentQuestion.explanation ? (
              <Accordion 
                title={
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Explanation</span>
                  </div>
                }
                defaultOpen={true}
                className="mt-6"
              >
                <div className="space-y-3">
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">The correct answer is <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded font-semibold">{currentQuestion.correct_answer}</span></p>
                    
                    {!isAnswered && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                        <p className="text-sm">You did not answer this question.</p>
                      </div>
                    )}
                    
                    {isAnswered && !isCorrect && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <p className="text-sm">You selected <span className="font-semibold inline-block px-2 py-1 bg-red-100 rounded">{currentAnswer.selected_answer}</span></p>
                      </div>
                    )}
                  </div>

                  <ReviewExplanation explanation={currentQuestion.explanation} />
                </div>
              </Accordion>
            ) : (
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-gray-700">
                  <p className="font-medium mb-2">The correct answer is <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded font-semibold">{currentQuestion.correct_answer}</span></p>
                  
                  {!isAnswered && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                      <p className="text-sm">You did not answer this question.</p>
                    </div>
                  )}
                  
                  {isAnswered && !isCorrect && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      <p className="text-sm">You selected <span className="font-semibold inline-block px-2 py-1 bg-red-100 rounded">{currentAnswer.selected_answer}</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Navigation Buttons */}
        <nav aria-label="Review navigation" className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={reviewIndex === 0}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              reviewIndex === 0
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'border-2 border-gray-300 bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 active:scale-95'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium">
              Question <span className="text-lg font-bold text-gray-900">{reviewIndex + 1}</span> of <span className="font-bold text-gray-900">{quizState.questions.length}</span>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={reviewIndex === quizState.questions.length - 1}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              reviewIndex === quizState.questions.length - 1
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-primary-600 text-white shadow-md hover:scale-105 hover:bg-primary-700 hover:shadow-lg active:scale-95'
            }`}
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>

        {/* Back to Results */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBackToResults}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-primary-600 transition-all duration-200 hover:bg-blue-50 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Results
          </button>
        </div>
      </div>
    </div>
  )
}
