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
    if (timer_mode === 'unlimited') {
      return (
        <div className="text-sm">
          <span className="text-gray-600">Time Elapsed: </span>
          <span className="font-mono font-semibold text-gray-900">{formatTime(elapsed)}</span>
        </div>
      )
    }

    if (timer_mode === 'per_question' && timer_value) {
      const isLowTime = questionRemaining <= 10 && questionRemaining > 0

      return (
        <div className={`text-sm ${isLowTime ? 'animate-pulse' : ''}`}>
          <span className="text-gray-600">Question Time: </span>
          <span className={`font-mono font-semibold ${isLowTime ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(questionRemaining)}
          </span>
        </div>
      )
    }

    if (timer_mode === 'whole_test' && timer_value) {
      const remaining = Math.max(0, (timer_value * 60) - elapsed)
      const isLowTime = remaining <= 300 && remaining > 0
      
      return (
        <div className={`text-sm ${isLowTime ? 'animate-pulse' : ''}`}>
          <span className="text-gray-600">Time Remaining: </span>
          <span className={`font-mono font-semibold ${isLowTime ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(remaining)}
          </span>
          {showWarning && isLowTime && (
            <span className="ml-2 text-xs text-red-600 font-medium">⚠ Hurry up!</span>
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
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title & Mode */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                mode === 'practice'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {mode === 'practice' ? '📖 Practice Mode' : '🎯 Exam Mode'}
              </span>
              {timer_mode !== 'unlimited' && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  ⏱ {timer_mode === 'per_question' ? 'Timed Questions' : 'Timed Test'}
                </span>
              )}
            </div>
          </div>

          {/* Center: Timer */}
          <div className="hidden md:block">
            {getTimeDisplay()}
          </div>

          {/* Right: Exit */}
          <button
            onClick={handleExit}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Save & Exit</span>
          </button>
        </div>

        {/* Mobile Timer */}
        <div className="md:hidden mt-3 text-center">
          {getTimeDisplay()}
        </div>
      </div>
    </div>
  )
}
