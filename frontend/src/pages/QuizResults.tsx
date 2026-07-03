import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QuizConfig, QuizState } from '@/types/quiz'
import { quizAttemptsApi } from '@/api/quiz-attempts'
import { quizProgressApi } from '@/api/quiz-progress'
import { deserializeQuizState } from '@/lib/quizProgress'

interface ResultMetrics {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unansweredQuestions: number
  accuracyPercentage: number
  totalTimeSeconds: number
}

export default function QuizResults() {
  const navigate = useNavigate()
  const { chapterId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionKey = searchParams.get('session_key') || ''
  const [metrics, setMetrics] = useState<ResultMetrics | null>(null)
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [nextBatchConfig, setNextBatchConfig] = useState<{
    start: number
    end: number
    batchSize: number
    config: QuizConfig
  } | null>(null)
  const [attemptSaved, setAttemptSaved] = useState(false)

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
      if (sessionKey && isProgressLoading) {
        return
      }

      navigate(`/chapters/${chapterId}`)
      return
    }

    setQuizState(resolvedState)
  }, [location.state, navigate, chapterId, sessionKey, progressData, isProgressLoading])

  useEffect(() => {
    if (!quizState || attemptSaved) return

    let correctCount = 0
    let wrongCount = 0
    let unansweredCount = 0

    quizState.questions.forEach(question => {
      const answer = quizState.answers.get(question.id)
      if (!answer) return

      if (answer.selected_answer === null) {
        unansweredCount++
        wrongCount++
      } else if (answer.selected_answer === question.correct_answer) {
        correctCount++
      } else {
        wrongCount++
      }
    })

    const totalQuestions = quizState.questions.length
    const accuracyPercentage = totalQuestions > 0
      ? (correctCount / totalQuestions) * 100
      : 0

    setMetrics({
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unansweredQuestions: unansweredCount,
      accuracyPercentage,
      totalTimeSeconds: quizState.elapsed_time
    })

    const rangeStart = quizState.config.question_range?.start || 1
    const batchSize = quizState.config.batch_size || 25
    const nextStart = rangeStart + quizState.questions.length
    const chapterQuestionCount = location.state?.chapterQuestionCount || totalQuestions

    if (nextStart <= chapterQuestionCount) {
      const nextEnd = Math.min(nextStart + batchSize - 1, chapterQuestionCount)
      setNextBatchConfig({
        start: nextStart,
        end: nextEnd,
        batchSize,
        config: quizState.config
      })
    } else {
      setNextBatchConfig(null)
    }

    const saveAttempt = async () => {
      try {
        await quizAttemptsApi.create({
          chapter_id: quizState.config.chapter_id,
          mode: quizState.config.mode,
          time_taken: quizState.elapsed_time,
          correct: correctCount,
          wrong: wrongCount,
          accuracy: accuracyPercentage
        })
        setAttemptSaved(true)

        // Remove persisted quiz progress from backend to avoid stale sessions
        if (sessionKey) {
          try {
            await quizProgressApi.delete(sessionKey)
          } catch (err) {
            console.error('Failed to delete quiz progress after attempt save:', err)
          }
        }
      } catch (error) {
        console.error('Failed to save quiz attempt:', error)
      }
    }

    saveAttempt()
  }, [quizState, attemptSaved, location.state])

  const formatTime = (seconds: number): string => {
    if (seconds < 0) return '00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }

  const handleBackToChapter = () => {
    navigate(`/chapters/${chapterId}`)
  }

  const handleReviewAnswers = () => {
    const params = new URLSearchParams()
    if (sessionKey) {
      params.set('session_key', sessionKey)
    }
    navigate(`/quiz/review/${chapterId}${params.toString() ? `?${params.toString()}` : ''}`, {
      state: { quizState }
    })
  }

  if (!metrics || !quizState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  // Summary View (existing code)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          <p className="mt-2 text-gray-600">Here's how you performed</p>
        </div>

        {/* Score Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Large Score Display */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-center">
            <div className="text-white">
              <div className="text-6xl font-bold mb-2">
                {metrics.correctAnswers}/{metrics.totalQuestions}
              </div>
              <div className="text-2xl font-semibold">
                {metrics.accuracyPercentage.toFixed(1)}% Accuracy
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Total Questions */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Total Questions
                </div>
              </div>

              {/* Correct Answers */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-700">
                  {metrics.correctAnswers}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Correct
                </div>
              </div>

              {/* Wrong Answers */}
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-700">
                  {metrics.wrongAnswers}
                </div>
                <div className="text-sm text-red-600 mt-1">
                  Wrong
                </div>
              </div>

              {/* Unanswered */}
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-700">
                  {metrics.unansweredQuestions}
                </div>
                <div className="text-sm text-yellow-600 mt-1">
                  Unanswered
                </div>
              </div>
            </div>

            {/* Time Taken */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-medium">
                  Time Taken: <span className="font-bold">{formatTime(metrics.totalTimeSeconds)}</span>
                </span>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-6 text-center">
              {metrics.accuracyPercentage >= 80 ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Excellent Performance!
                </div>
              ) : metrics.accuracyPercentage >= 60 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Good Job! Keep Practicing
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Keep Practicing to Improve
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleBackToChapter}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Chapter
          </button>
          <button
            onClick={handleReviewAnswers}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Review Answers
          </button>
          {nextBatchConfig && (
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  mode: nextBatchConfig.config.mode,
                  timer_mode: nextBatchConfig.config.timer_mode,
                  batch_size: nextBatchConfig.batchSize.toString(),
                  range_start: nextBatchConfig.start.toString(),
                  range_end: nextBatchConfig.end.toString()
                })
                if (nextBatchConfig.config.timer_value) {
                  params.append('timer_value', nextBatchConfig.config.timer_value.toString())
                }
                navigate(`/quiz/${chapterId}?${params.toString()}`)
              }}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Next Batch
            </button>
          )}
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (sessionKey) {
                // Preserve config but discard the saved session key to restart the quiz
                const config = quizState?.config
                if (config) {
                  params.set('mode', config.mode)
                  params.set('timer_mode', config.timer_mode)
                  if (config.timer_value !== undefined) {
                    params.set('timer_value', config.timer_value.toString())
                  }
                  if (config.batch_size !== undefined) {
                    params.set('batch_size', config.batch_size.toString())
                  }
                  if (config.question_range) {
                    params.set('range_start', config.question_range.start.toString())
                    params.set('range_end', config.question_range.end.toString())
                  }
                }
              }
              navigate(`/quiz/${chapterId}${params.toString() ? `?${params.toString()}` : ''}`)
            }}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry Quiz
          </button>
        </div>

        {/* Note about future features */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Detailed answer review and statistics coming soon!</p>
        </div>
      </div>
    </div>
  )
}
