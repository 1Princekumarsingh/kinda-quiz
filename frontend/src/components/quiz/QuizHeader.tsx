import { useState, useEffect, useRef } from 'react'

interface QuizHeaderProps {
  title: string
  mode: 'practice' | 'exam'
  timer_mode: 'unlimited' | 'per_question' | 'whole_test'
  timer_value?: number
  start_time: number
  currentQuestionIndex?: number
  onTimeUp?: () => void
  onQuestionTimeUp?: () => void
  onExit: () => void
}

export default function QuizHeader({
  title,
  mode,
  timer_mode,
  timer_value,
  start_time,
  currentQuestionIndex = 0,
  onTimeUp,
  onQuestionTimeUp,
  onExit
}: QuizHeaderProps) {
  const [elapsed, setElapsed] = useState(0)
  const [questionRemaining, setQuestionRemaining] = useState(timer_value ?? 0)
  const [showWarning, setShowWarning] = useState(false)

  const onTimeUpRef = useRef(onTimeUp)
  const onQuestionTimeUpRef = useRef(onQuestionTimeUp)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    onQuestionTimeUpRef.current = onQuestionTimeUp
  }, [onQuestionTimeUp])

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - start_time) / 1000)
      setElapsed(newElapsed)

      if (timer_mode === 'whole_test' && timer_value) {
        const remaining = (timer_value * 60) - newElapsed
        if (remaining <= 300 && remaining > 0) {
          setShowWarning(true)
        }
        if (remaining <= 0) {
          onTimeUpRef.current?.()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [start_time, timer_mode, timer_value])

  useEffect(() => {
    if (timer_mode !== 'per_question' || !timer_value) return

    setQuestionRemaining(timer_value)
    setShowWarning(false)

    const interval = setInterval(() => {
      setQuestionRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onQuestionTimeUpRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timer_mode, timer_value, currentQuestionIndex])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeDisplay = () => {
    const sharedClasses = 'rounded-lg border px-2 py-1.5 shadow-sm text-xs sm:text-sm sm:px-3 sm:py-2 sm:rounded-2xl'

    if (timer_mode === 'unlimited') {
      return (
        <div className={`${sharedClasses} border-slate-200 bg-slate-50`}>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">Elapsed</div>
          <div className="font-mono text-sm font-semibold text-slate-900 sm:text-lg">{formatTime(elapsed)}</div>
        </div>
      )
    }

    if (timer_mode === 'per_question' && timer_value) {
      const isLowTime = questionRemaining <= 10 && questionRemaining > 0
      const tone = isLowTime ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'

      return (
        <div className={`${sharedClasses} ${tone} ${isLowTime ? 'animate-pulse' : ''}`}>
          <div className="text-[9px] font-semibold uppercase tracking-wide sm:text-[11px]">Q-timer</div>
          <div className="font-mono text-sm font-semibold sm:text-lg">{formatTime(questionRemaining)}</div>
        </div>
      )
    }

    if (timer_mode === 'whole_test' && timer_value) {
      const remaining = Math.max(0, (timer_value * 60) - elapsed)
      const isLowTime = remaining <= 300 && remaining > 0
      const tone = remaining <= 60 ? 'border-rose-200 bg-rose-50 text-rose-700' : isLowTime ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'

      return (
        <div className={`${sharedClasses} ${tone} ${isLowTime ? 'animate-pulse' : ''}`}>
          <div className="text-[9px] font-semibold uppercase tracking-wide sm:text-[11px]">Time left</div>
          <div className="font-mono text-sm font-semibold sm:text-lg">{formatTime(remaining)}</div>
          {showWarning && isLowTime && (
            <div className="text-[8px] font-medium sm:text-[11px]">Hurry up</div>
          )}
        </div>
      )
    }

    return null
  }

  const handleExit = () => {
    const confirmed = window.confirm(
      'Are you sure you want to exit? Your progress will be saved and you can resume later.'
    )
    if (confirmed) {
      onExit()
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:px-2.5 sm:py-1 sm:text-[11px] ${
                mode === 'practice'
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-violet-100 text-violet-700'
              }`}>
                {mode === 'practice' ? 'Practice' : 'Exam'}
              </span>
              {timer_mode !== 'unlimited' && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 sm:px-2.5 sm:py-1 sm:text-[11px]">
                  {timer_mode === 'per_question' ? 'Timed' : 'Timed test'}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:block">
            {getTimeDisplay()}
          </div>

          <button
            onClick={handleExit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 sm:h-10 sm:w-auto sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:font-semibold"
            title="Save & Exit"
          >
            <svg className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Save & Exit</span>
          </button>
        </div>

        <div className="mt-2 flex justify-center sm:hidden">
          {getTimeDisplay()}
        </div>
      </div>
    </div>
  )
}
