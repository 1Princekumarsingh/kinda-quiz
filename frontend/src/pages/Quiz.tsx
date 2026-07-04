import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import { quizProgressApi } from '@/api/quiz-progress'
import { useQuizState } from '@/hooks/useQuizState'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useDebounceClick } from '@/hooks/useDebounceClick'
import { useLongPress } from '@/hooks/useLongPress'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { triggerHaptic } from '@/lib/haptics'
import { isMobileViewport } from '@/lib/viewport'
import { QuizConfig, ConfidenceLevel, TimerMode, QuizQuestion } from '@/types/quiz'
import { QuizProgress, QuizProgressCreate, QuizProgressUpdate } from '@/types/quiz-progress'
import { QuestionStatus } from '@/types/question'
import { deserializeQuizState, serializeQuizState } from '@/lib/quizProgress'
import QuizHeader from '@/components/quiz/QuizHeader'
import QuizNavigationBar from '@/components/quiz/QuizNavigationBar'
import QuestionPalette from '@/components/quiz/QuestionPalette'

function buildSessionKey(config: QuizConfig): string {
  return [
    config.chapter_id,
    config.mode,
    config.timer_mode,
    config.timer_value ?? '',
    config.batch_size ?? '',
    config.question_range?.start ?? '',
    config.question_range?.end ?? ''
  ].join('-')
}

function parseQuizConfig(chapterId: string, searchParams: URLSearchParams): QuizConfig {
  const rangeStartStr = searchParams.get('range_start')
  const rangeEndStr = searchParams.get('range_end')
  const timerMode = searchParams.get('timer_mode') as TimerMode | null

  return {
    chapter_id: parseInt(chapterId),
    mode: (searchParams.get('mode') as 'practice' | 'exam') || 'practice',
    timer_mode: timerMode || 'unlimited',
    timer_value: searchParams.get('timer_value') ? parseInt(searchParams.get('timer_value')!) : undefined,
    batch_size: searchParams.get('batch_size') ? parseInt(searchParams.get('batch_size')!) : undefined,
    question_range: rangeStartStr && rangeEndStr ? {
      start: parseInt(rangeStartStr),
      end: parseInt(rangeEndStr)
    } : undefined
  }
}

export default function Quiz() {
  const navigate = useNavigate()
  const { chapterId } = useParams()
  const [searchParams] = useSearchParams()

  const config = parseQuizConfig(chapterId!, searchParams)
  const sessionKeyQueryParam = searchParams.get('session_key')
  const sessionKey = sessionKeyQueryParam || buildSessionKey(config)
  const isExplicitSessionKey = Boolean(sessionKeyQueryParam)

  const {
    data: progressData,
    isLoading: isProgressLoading,
    error: progressError
  } = useQuery({
    queryKey: ['quizProgress', sessionKey],
    queryFn: () => quizProgressApi.get(sessionKey),
    enabled: Boolean(sessionKey),
    retry: false
  })

  const effectiveConfig = progressData?.config ?? config
  const questionsEnabled = !sessionKey || !!progressData || !isExplicitSessionKey

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions', chapterId, effectiveConfig.question_range, effectiveConfig.batch_size],
    queryFn: () => questionsApi.list({
      chapter_id: parseInt(chapterId!),
      page: 1,
      page_size: effectiveConfig.batch_size || 100,
      range_start: effectiveConfig.question_range?.start,
      range_end: effectiveConfig.question_range?.end
    }),
    enabled: questionsEnabled
  })

  if (isLoading || isProgressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (isExplicitSessionKey && progressError) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to resume quiz session. Please start a new quiz.</p>
          <button
            onClick={() => navigate(`/chapters/${chapterId}`)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-150 hover:scale-105 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!questionsData || questionsData.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <p className="text-gray-600">No questions available for this quiz.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-150 hover:scale-105 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuizSession
      key={buildSessionKey(effectiveConfig)}
      config={effectiveConfig}
      chapterId={chapterId!}
      questions={questionsData.data}
      totalQuestionCount={questionsData.total}
      sessionKey={sessionKey}
      progressData={progressData}
      isExplicitSessionKey={isExplicitSessionKey}
      isProgressLoading={isProgressLoading}
    />
  )
}

interface QuizSessionProps {
  config: QuizConfig
  chapterId: string
  questions: QuizQuestion[]
  totalQuestionCount: number
  sessionKey: string
  progressData?: QuizProgress
  isExplicitSessionKey: boolean
  isProgressLoading: boolean
}

function QuizSession({ config, chapterId, questions, totalQuestionCount, sessionKey, progressData, isExplicitSessionKey, isProgressLoading }: QuizSessionProps) {
  const navigate = useNavigate()
  
  const [showPalette, setShowPalette] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)
  const debounceClick = useDebounceClick()
  const restoredQuizState = useMemo(
    () => progressData ? deserializeQuizState(progressData.state) : undefined,
    [progressData]
  )

  const {
    state,
    currentQuestion,
    currentAnswer,
    stats,
    actions
  } = useQuizState(config, questions, restoredQuizState)

  // Ref to hold latest quiz state for timer callbacks to avoid including
  // `state` in their dependency arrays (prevents frequent callback recreation).
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  const [progressCreated, setProgressCreated] = useState(false)

  const createProgressMutation = useMutation({
    mutationFn: (data: QuizProgressCreate) => quizProgressApi.create(data),
    onSuccess: () => setProgressCreated(true)
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ sessionKey, data }: { sessionKey: string; data: QuizProgressUpdate }) =>
      quizProgressApi.update(sessionKey, data),
    onError: (error: unknown) => {
      console.error('Failed to update quiz progress:', error)
    }
  })

  useEffect(() => {
    if (isExplicitSessionKey) return
    if (progressCreated || createProgressMutation.isPending) return
    if (progressData) return
    if (!questions || !questions.length) return

    createProgressMutation.mutate({
      chapter_id: config.chapter_id,
      session_key: sessionKey,
      config,
      state: serializeQuizState(state),
      is_completed: state.is_completed
    })
  }, [isExplicitSessionKey, progressCreated, createProgressMutation, questions, config, sessionKey, state, progressData])

  const currentSearch = window.location.search
  const currentPath = window.location.pathname

  useEffect(() => {
    if (!progressCreated || isExplicitSessionKey) return

    const params = new URLSearchParams(currentSearch)
    params.set('session_key', sessionKey)

    // Use window.history.replaceState instead of navigate to avoid component remount
    const newUrl = `${currentPath}?${params.toString()}`
    window.history.replaceState(null, '', newUrl)
  }, [progressCreated, isExplicitSessionKey, currentSearch, currentPath, sessionKey])

  const progressIsReady =
    (isExplicitSessionKey && !isProgressLoading && !!progressData) ||
    (!isExplicitSessionKey && (progressCreated || progressData !== undefined))

  useEffect(() => {
    if (!progressIsReady) return
    if (!sessionKey || !questions || !questions.length) return

    const timerId = window.setTimeout(() => {
      updateProgressMutation.mutate({
        sessionKey,
        data: {
          state: serializeQuizState(state),
          is_completed: state.is_completed
        }
      })
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [progressIsReady, sessionKey, updateProgressMutation, state, questions])

  // Mutation for updating question status
  const statusMutation = useMutation({
    mutationFn: ({ questionId, status }: { questionId: number; status: QuestionStatus }) =>
      questionsApi.updateStatus(questionId, { status }),
    onSuccess: () => {
      setStatusUpdateError(null)
    },
    onError: (error: unknown) => {
      console.error('Failed to update status:', error)
      const apiError = error as { response?: { data?: { detail?: string } } }
      const errorMessage = apiError.response?.data?.detail || 'Failed to update question status'
      setStatusUpdateError(errorMessage)
      // Show error to user
      setTimeout(() => setStatusUpdateError(null), 5000)
    }
  })

  // Mark current question as visited
  useEffect(() => {
    if (currentQuestion && currentAnswer && !currentAnswer.is_visited) {
      actions.markVisited(currentQuestion.id)
    }
  }, [currentQuestion, currentAnswer, actions])

  // Reset feedback and explanation when question changes
  useEffect(() => {
    setShowFeedback(false)
    setIsExplanationOpen(false)
    setStatusUpdateError(null)
  }, [state.current_question_index])

  // Track time spent on question
  useEffect(() => {
    const startTime = Date.now()

    return () => {
      if (currentQuestion) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)
        actions.updateTimeSpent(currentQuestion.id, timeSpent)
      }
    }
  }, [state.current_question_index, currentQuestion, actions])

  const handleSubmitQuiz = useCallback(() => {
    const unansweredCount = stats.unanswered
    
    let message = 'Are you sure you want to submit the quiz?'
    if (unansweredCount > 0) {
      message += `\n\nYou have ${unansweredCount} unanswered question${unansweredCount !== 1 ? 's' : ''}.`
    }

    const confirmed = window.confirm(message)
    if (confirmed) {
      actions.completeQuiz()
      const params = new URLSearchParams()
      params.set('session_key', sessionKey)
      const latest = stateRef.current
      navigate(`/quiz/results/${chapterId}?${params.toString()}`, {
        state: { 
          quizState: latest,
          chapterQuestionCount: totalQuestionCount || latest.questions.length
        }
      })
    }
  }, [stats.unanswered, actions, navigate, chapterId, totalQuestionCount, sessionKey])

  const handleTimeUp = useCallback(() => {
    alert('Time is up! Your quiz will be submitted automatically.')
    actions.completeQuiz()
    const params = new URLSearchParams()
    params.set('session_key', sessionKey)
    const latest = stateRef.current
    navigate(`/quiz/results/${chapterId}?${params.toString()}`, {
      state: { 
        quizState: latest,
        chapterQuestionCount: totalQuestionCount || latest.questions.length
      }
    })
  }, [actions, navigate, chapterId, totalQuestionCount, sessionKey])

  const handleQuestionTimeUp = useCallback(() => {
    const latest = stateRef.current
    if (latest.current_question_index < latest.questions.length - 1) {
      actions.nextQuestion()
      return
    }

    actions.completeQuiz()
    const params = new URLSearchParams()
    params.set('session_key', sessionKey)
    navigate(`/quiz/results/${chapterId}?${params.toString()}`, {
      state: {
        quizState: latest,
        chapterQuestionCount: totalQuestionCount || latest.questions.length
      }
    })
  }, [actions, navigate, chapterId, totalQuestionCount, sessionKey])

  if (!currentQuestion || !currentAnswer) {
    return null
  }

  const isLastQuestion = state.current_question_index === state.questions.length - 1
  const canAdvanceOrSubmit = config.mode !== 'practice' || showFeedback

  const handleSelectAnswer = (answer: string | null) => {
    debounceClick(() => {
      actions.selectAnswer(currentQuestion.id, answer)
      triggerHaptic(answer ? 'light' : 'warning')
      
      // Show feedback immediately in Practice Mode
      if (config.mode === 'practice' && answer) {
        setShowFeedback(true)
        triggerHaptic('success')
      }
    })
  }

  const queryClient = useQueryClient()
  const [showLongPressHint, setShowLongPressHint] = useState(false)

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGesture({
    onSwipeLeft: () => {
      if (isLastQuestion) {
        handleSubmitQuiz()
      } else {
        actions.nextQuestion()
        triggerHaptic('light')
      }
    },
    onSwipeRight: () => {
      actions.previousQuestion()
      triggerHaptic('light')
    }
  })

  const refreshQuiz = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    queryClient.invalidateQueries({ queryKey: ['questions', chapterId] })
    setShowLongPressHint(true)
    window.setTimeout(() => setShowLongPressHint(false), 2000)
  }, [chapterId, queryClient])

  const { isReadyToRefresh, isRefreshing, transformStyle, onTouchStart: onPullStart, onTouchMove: onPullMove, onTouchEnd: onPullEnd, onTouchCancel: onPullCancel } = usePullToRefresh({
    onRefresh: refreshQuiz,
    threshold: 80,
    disabled: !isMobileViewport()
  })

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      setShowPalette(true)
      triggerHaptic('medium')
    },
    onClick: () => {},
    delay: 500
  })

  const handleExit = () => {
    navigate(-1)
  }

  const handleConfidenceSelect = (confidence: ConfidenceLevel) => {
    if (!currentQuestion || !currentAnswer) return
    
    // Update frontend state
    actions.setConfidence(currentQuestion.id, confidence)
    
    // Determine the backend status based on correctness + confidence
    // Per SPEC.md Section 7 - Practice Mode Status Update Rules:
    // - User answers correctly + selects "Mastered" → Status = MASTERED
    // - User answers correctly + selects "Review" → Status = REVIEW
    // - User answers correctly + selects "Almost Forgot" → Status = ALMOST_FORGOT
    // - User answers incorrectly → Status = ERROR (overrides confidence)
    
    const isCorrect = currentAnswer.selected_answer === currentQuestion.correct_answer
    
    let backendStatus: QuestionStatus
    
    if (!isCorrect) {
      // Incorrect answer always becomes ERROR
      backendStatus = 'ERROR'
    } else {
      // Correct answer - use confidence to determine status
      switch (confidence) {
        case 'mastered':
          backendStatus = 'MASTERED'
          break
        case 'review':
          backendStatus = 'REVIEW'
          break
        case 'almost_forgot':
          backendStatus = 'ALMOST_FORGOT'
          break
        default:
          backendStatus = 'NEW'
      }
    }
    
    // Update status in backend
    statusMutation.mutate({
      questionId: currentQuestion.id,
      status: backendStatus
    })
  }

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <QuizHeader
        title={`Chapter ${chapterId} Quiz`}
        mode={config.mode}
        timer_mode={config.timer_mode}
        timer_value={config.timer_value}
        start_time={state.start_time}
        currentQuestionIndex={state.current_question_index}
        onTimeUp={handleTimeUp}
        onQuestionTimeUp={handleQuestionTimeUp}
        onExit={handleExit}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50 pb-32 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Question Area */}
            <div className="lg:col-span-2">
              <div
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 touch-manipulation select-none-safe"
                style={transformStyle}
                onTouchStart={(event) => {
                  longPressHandlers.onTouchStart(event)
                  onPullStart(event)
                  onTouchStart(event)
                }}
                onTouchMove={(event) => {
                  longPressHandlers.onTouchMove?.()
                  onPullMove(event)
                  onTouchMove(event)
                }}
                onTouchEnd={(event) => {
                  longPressHandlers.onTouchEnd(event)
                  onPullEnd()
                  onTouchEnd(event)
                }}
                onTouchCancel={() => {
                  longPressHandlers.onTouchCancel?.()
                  onPullCancel()
                }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Current question</div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {currentQuestion.question_number}. {currentQuestion.question_text}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">Long press the question card to open the palette on mobile.</p>
                  </div>
                  <button
                    onClick={() => {
                      debounceClick(() => {
                        actions.toggleBookmark(currentQuestion.id)
                        triggerHaptic('light')
                      })
                    }}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                      currentAnswer.is_bookmarked
                        ? 'border-violet-200 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    title={currentAnswer.is_bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
                  >
                    <svg className="h-5 w-5" fill={currentAnswer.is_bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
                  <p>Swipe left or right to move between questions on mobile.</p>
                  <p className="mt-1 text-xs text-slate-500">Pull down to refresh questions and long press to open the palette.</p>
                </div>

                <div className="space-y-3">
                  {isRefreshing && (
                    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700 transition-all duration-200">
                      Refreshing questions...
                    </div>
                  )}
                  {isReadyToRefresh && !isRefreshing && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700 transition-all duration-200">
                      Release to refresh
                    </div>
                  )}
                  {options.map((option) => {
                    const isSelected = currentAnswer.selected_answer === option.key
                    const isCorrect = option.key === currentQuestion.correct_answer
                    const shouldShowFeedback = config.mode === 'practice' && showFeedback && currentAnswer.selected_answer !== null
                    
                    // Determine styling based on feedback state
                    let optionStyle = ''
                    let circleStyle = ''
                    
                    if (shouldShowFeedback) {
                      if (isCorrect && isSelected) {
                        // User selected correct answer
                        optionStyle = 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        circleStyle = 'border-green-600 bg-green-600 text-white'
                      } else if (isCorrect) {
                        // Show correct answer (not selected)
                        optionStyle = 'border-green-500 bg-green-50'
                        circleStyle = 'border-green-600 text-green-600'
                      } else if (isSelected) {
                        // User selected wrong answer
                        optionStyle = 'border-red-500 bg-red-50 ring-2 ring-red-200'
                        circleStyle = 'border-red-600 bg-red-600 text-white'
                      } else {
                        // Other options
                        optionStyle = 'border-gray-200 bg-white'
                        circleStyle = 'border-gray-300 text-gray-600'
                      }
                    } else {
                      // Normal state (no feedback)
                      if (isSelected) {
                        optionStyle = 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                        circleStyle = 'border-primary-600 bg-primary-600 text-white'
                      } else {
                        optionStyle = 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        circleStyle = 'border-gray-300 text-gray-600'
                      }
                    }
                    
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectAnswer(option.key)}
                        disabled={shouldShowFeedback}
                        className={`w-full min-h-[56px] rounded-2xl border-2 p-4 text-left transition-all duration-200 ${optionStyle} ${shouldShowFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${circleStyle}`}>
                            {option.key}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base leading-6 text-slate-900">{option.text}</p>
                            {shouldShowFeedback && (
                              <div className="mt-2">
                                {isCorrect && isSelected && (
                                  <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Your Answer - Correct!
                                  </span>
                                )}
                                {isCorrect && !isSelected && (
                                  <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                                    Correct Answer
                                  </span>
                                )}
                                {!isCorrect && isSelected && (
                                  <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Your Answer - Incorrect
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Collapsible Explanation Box */}
                {config.mode === 'practice' && showFeedback && currentQuestion.explanation && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        debounceClick(() => {
                          setIsExplanationOpen(!isExplanationOpen)
                          triggerHaptic('light')
                        })
                      }}
                      className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <span>Explanation</span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${isExplanationOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExplanationOpen && (
                      <div className="border-t border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                        {currentQuestion.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Clear Answer */}
                {currentAnswer.selected_answer && !showFeedback && (
                  <button
                    onClick={() => handleSelectAnswer(null)}
                    className="mt-4 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-700"
                  >
                    Clear Answer
                  </button>
                )}

                {/* Confidence Buttons - Only in Practice Mode with Feedback */}
                {config.mode === 'practice' && showFeedback && currentAnswer.selected_answer !== null && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                      How confident are you with this answer?
                    </h3>
                    
                    {/* Error Message */}
                    {statusUpdateError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">Failed to save</p>
                            <p className="text-sm text-red-700 mt-1">{statusUpdateError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Success Message */}
                    {statusMutation.isSuccess && !statusUpdateError && currentAnswer.confidence_level && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-medium text-green-800">
                            Status saved successfully
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          debounceClick(() => {
                            handleConfidenceSelect('mastered')
                            triggerHaptic('success')
                          })
                        }}
                        disabled={statusMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          currentAnswer.confidence_level === 'mastered'
                            ? 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-200'
                            : 'border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                        } ${
                          statusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {statusMutation.isPending && currentAnswer.confidence_level === 'mastered' ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>Mastered</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          debounceClick(() => {
                            handleConfidenceSelect('review')
                            triggerHaptic('light')
                          })
                        }}
                        disabled={statusMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          currentAnswer.confidence_level === 'review'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                            : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                        } ${
                          statusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {statusMutation.isPending && currentAnswer.confidence_level === 'review' ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>Review</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          debounceClick(() => {
                            handleConfidenceSelect('almost_forgot')
                            triggerHaptic('warning')
                          })
                        }}
                        disabled={statusMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          currentAnswer.confidence_level === 'almost_forgot'
                            ? 'border-yellow-600 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200'
                            : 'border-gray-300 text-gray-700 hover:border-yellow-500 hover:bg-yellow-50'
                        } ${
                          statusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {statusMutation.isPending && currentAnswer.confidence_level === 'almost_forgot' ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>Almost Forgot</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Palette (Desktop/Tablet) */}
            <div className="hidden md:block">
              <div className="sticky top-24">
                <QuestionPalette
                  state={state}
                  onQuestionSelect={actions.goToQuestion}
                />
              </div>
            </div>
          </div>

          {showLongPressHint && (
            <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg shadow-slate-900/20 transition-all duration-200">
              Long press the screen to open the question palette.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar (Fixed Bottom on Desktop, Sticky on Mobile) */}
      <div className="sticky lg:fixed bottom-0 left-0 right-0">
        <QuizNavigationBar
          currentIndex={state.current_question_index}
          totalQuestions={state.questions.length}
          answeredCount={Array.from(state.answers.values()).filter((answer) => answer.selected_answer !== null).length}
          isAnswered={currentAnswer.selected_answer !== null}
          isBookmarked={currentAnswer.is_bookmarked}
          canGoPrevious={state.current_question_index > 0}
          canGoNext={canAdvanceOrSubmit}
          onPrevious={actions.previousQuestion}
          onNext={isLastQuestion ? handleSubmitQuiz : actions.nextQuestion}
          onToggleBookmark={() => actions.toggleBookmark(currentQuestion.id)}
          onTogglePalette={() => setShowPalette(true)}
          onSubmit={handleSubmitQuiz}
        />
      </div>

      {/* Question Palette Modal (Mobile) */}
      {showPalette && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <QuestionPalette
              state={state}
              onQuestionSelect={(index) => {
                actions.goToQuestion(index)
                setShowPalette(false)
              }}
              onClose={() => setShowPalette(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
