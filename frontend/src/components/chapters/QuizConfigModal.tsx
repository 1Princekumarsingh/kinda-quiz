import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import { QuizMode, TimerMode } from '@/types/quiz'
import { QuizProgress } from '@/types/quiz-progress'

interface QuizConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: (config: QuizConfiguration) => void
  chapterQuestionCount: number
  chapterId: number
  chapterProgress?: QuizProgress | null
}

export interface QuizConfiguration {
  mode: QuizMode
  timer_mode: TimerMode
  timer_value?: number
  question_range?: {
    start: number
    end: number
  }
  batch_size?: number
}

export default function QuizConfigModal({
  isOpen,
  onClose,
  onStart,
  chapterQuestionCount,
  chapterProgress
}: QuizConfigModalProps) {
  const [mode, setMode] = useState<QuizMode>('practice')
  const [timerMode, setTimerMode] = useState<TimerMode>('unlimited')
  const [timerValue, setTimerValue] = useState<number>(60)
  const [questionSelection, setQuestionSelection] = useState<'all' | 'range' | 'continue'>('all')
  const [rangeStart, setRangeStart] = useState<number>(1)
  const [rangeEnd, setRangeEnd] = useState<number>(chapterQuestionCount)
  const [batchSize, setBatchSize] = useState<number>(25)
  const [rangeError, setRangeError] = useState<string | null>(null)

  useEffect(() => {
    if (chapterProgress && !chapterProgress.state.is_completed) {
      setMode(chapterProgress.state.config.mode)
      setTimerMode(chapterProgress.state.config.timer_mode)
      setTimerValue(chapterProgress.state.config.timer_value || 60)
      setBatchSize(chapterProgress.state.config.batch_size || 25)
      setQuestionSelection('continue')
      const current = chapterProgress.state.current_question_index + 1
      const end = Math.min(current + (chapterProgress.state.config.batch_size || 25) - 1, chapterQuestionCount)
      setRangeStart(current)
      setRangeEnd(end)
    } else {
      setMode('practice')
      setTimerMode('unlimited')
      setTimerValue(60)
      setBatchSize(25)
      setQuestionSelection('all')
      setRangeStart(1)
      setRangeEnd(chapterQuestionCount)
    }
    setRangeError(null)
  }, [chapterProgress, chapterQuestionCount, isOpen])

  // Validate range in real-time
  useEffect(() => {
    if (questionSelection !== 'range') {
      setRangeError(null)
      return
    }

    // Check for empty or invalid numbers
    if (isNaN(rangeStart) || isNaN(rangeEnd)) {
      setRangeError('Please enter valid question numbers')
      return
    }

    // Check minimum bounds
    if (rangeStart < 1) {
      setRangeError('Start question must be at least 1')
      return
    }

    // Check maximum bounds
    if (rangeEnd > chapterQuestionCount) {
      setRangeError(`End question cannot exceed ${chapterQuestionCount}`)
      return
    }

    // Check order
    if (rangeStart > rangeEnd) {
      setRangeError('Start question must be ≤ end question')
      return
    }

    // Check for empty range
    if (rangeEnd - rangeStart < 0) {
      setRangeError('Range must include at least 1 question')
      return
    }

    // All validations passed
    setRangeError(null)
  }, [questionSelection, rangeStart, rangeEnd, chapterQuestionCount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate custom range if selected
    if (questionSelection === 'range') {
      if (rangeError) {
        // Error already displayed, don't submit
        return
      }

      // Additional validation checks
      if (isNaN(rangeStart) || isNaN(rangeEnd)) {
        setRangeError('Please enter valid question numbers')
        return
      }
      if (rangeStart < 1) {
        setRangeError('Start question must be at least 1')
        return
      }
      if (rangeEnd > chapterQuestionCount) {
        setRangeError(`End question cannot exceed ${chapterQuestionCount}`)
        return
      }
      if (rangeStart > rangeEnd) {
        setRangeError('Start question must be ≤ end question')
        return
      }
    }

    const config: QuizConfiguration = {
      mode,
      timer_mode: timerMode,
      timer_value: timerMode !== 'unlimited' ? timerValue : undefined,
      question_range: (questionSelection === 'range' || questionSelection === 'continue') ? {
        start: rangeStart,
        end: rangeEnd
      } : undefined,
      batch_size: batchSize
    }

    onStart(config)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Quiz">
      <form onSubmit={handleSubmit} className="space-y-6 lg:mx-auto lg:max-w-[600px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Quiz Mode */}
          <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quiz Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="mode"
                value="practice"
                checked={mode === 'practice'}
                onChange={(e) => setMode(e.target.value as QuizMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">📖 Practice Mode</div>
                <div className="text-sm text-gray-600 mt-1">
                  Get immediate feedback and self-assess your understanding
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="mode"
                value="exam"
                checked={mode === 'exam'}
                onChange={(e) => setMode(e.target.value as QuizMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">🎯 Exam Mode</div>
                <div className="text-sm text-gray-600 mt-1">
                  Simulate real exam conditions with no immediate feedback
                </div>
              </div>
            </label>
          </div>
        </div>

          {/* Timer Mode */}
          <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Timer Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timer_mode"
                value="unlimited"
                checked={timerMode === 'unlimited'}
                onChange={(e) => setTimerMode(e.target.value as TimerMode)}
              />
              <span className="font-medium text-gray-900">⏱ Unlimited Time</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timer_mode"
                value="per_question"
                checked={timerMode === 'per_question'}
                onChange={(e) => setTimerMode(e.target.value as TimerMode)}
              />
              <span className="font-medium text-gray-900">⏰ Time Per Question</span>
            </label>
            {timerMode === 'per_question' && (
              <div className="ml-9 flex items-center space-x-3">
                <select
                  value={timerValue}
                  onChange={(e) => setTimerValue(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
                <span className="text-sm text-gray-600">per question</span>
              </div>
            )}
            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timer_mode"
                value="whole_test"
                checked={timerMode === 'whole_test'}
                onChange={(e) => setTimerMode(e.target.value as TimerMode)}
              />
              <span className="font-medium text-gray-900">⏲ Whole Test Timer</span>
            </label>
            {timerMode === 'whole_test' && (
              <div className="ml-9 flex items-center space-x-3">
                <select
                  value={timerValue}
                  onChange={(e) => setTimerValue(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
                <span className="text-sm text-gray-600">for entire quiz</span>
              </div>
            )}
          </div>
        </div>

          {/* Question Selection */}
          <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Question Selection
          </label>
          <div className="space-y-2">
            {chapterProgress && !chapterProgress.state.is_completed && (
              <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="question_selection"
                  value="continue"
                  checked={questionSelection === 'continue'}
                  onChange={() => {
                    setQuestionSelection('continue')
                    const start = chapterProgress.state.current_question_index + 1
                    const end = Math.min(start + (chapterProgress.state.config.batch_size || 25) - 1, chapterQuestionCount)
                    setRangeStart(start)
                    setRangeEnd(end)
                  }}
                />
                <span className="font-medium text-gray-900">
                  Continue Chapter (Resume from Question {chapterProgress.state.current_question_index + 1})
                </span>
              </label>
            )}
            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="question_selection"
                value="all"
                checked={questionSelection === 'all'}
                onChange={(e) => setQuestionSelection(e.target.value as 'all' | 'range' | 'continue')}
              />
              <span className="font-medium text-gray-900">All Questions ({chapterQuestionCount})</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="question_selection"
                value="range"
                checked={questionSelection === 'range'}
                onChange={(e) => {
                  setQuestionSelection(e.target.value as 'all' | 'range' | 'continue')
                  // Reset to valid defaults
                  if (rangeStart < 1) setRangeStart(1)
                  if (rangeEnd > chapterQuestionCount) setRangeEnd(chapterQuestionCount)
                  if (rangeStart > rangeEnd) setRangeEnd(rangeStart)
                }}
              />
              <span className="font-medium text-gray-900">Custom Range</span>
            </label>
            {questionSelection === 'range' && (
              <div className="ml-9 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <input
                      type="number"
                      min={1}
                      max={chapterQuestionCount}
                      value={rangeStart}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 1 : Number(e.target.value)
                        setRangeStart(value)
                      }}
                      onBlur={(e) => {
                        // Ensure valid number on blur
                        let value = Number(e.target.value)
                        if (isNaN(value) || value < 1) value = 1
                        if (value > chapterQuestionCount) value = chapterQuestionCount
                        setRangeStart(value)
                      }}
                      className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        rangeError 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="1"
                    />
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">To</label>
                    <input
                      type="number"
                      min={rangeStart}
                      max={chapterQuestionCount}
                      value={rangeEnd}
                      onChange={(e) => {
                        const value = e.target.value === '' ? rangeStart : Number(e.target.value)
                        setRangeEnd(value)
                      }}
                      onBlur={(e) => {
                        // Ensure valid number on blur
                        let value = Number(e.target.value)
                        if (isNaN(value) || value < rangeStart) value = rangeStart
                        if (value > chapterQuestionCount) value = chapterQuestionCount
                        setRangeEnd(value)
                      }}
                      className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        rangeError 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder={chapterQuestionCount.toString()}
                    />
                  </div>
                </div>
                
                {/* Question count display */}
                {!rangeError && rangeStart && rangeEnd && rangeEnd >= rangeStart && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-700">
                      {rangeEnd - rangeStart + 1} question{rangeEnd - rangeStart + 1 !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
                
                {/* Error message */}
                {rangeError && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{rangeError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

          {/* Batch Size */}
          <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Batch Size
          </label>
          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={10}>10 questions</option>
            <option value={25}>25 questions</option>
            <option value={50}>50 questions</option>
            <option value={100}>100 questions</option>
          </select>
          <p className="mt-2 text-sm text-gray-600">
            Number of questions to practice in this session
          </p>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t bg-white px-6 py-4 md:gap-4 lg:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={questionSelection === 'range' && !!rangeError}
            className={`min-h-[44px] px-6 py-2 rounded-lg transition-colors font-medium ${
              questionSelection === 'range' && rangeError
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
      </form>
    </Modal>
  )
}
